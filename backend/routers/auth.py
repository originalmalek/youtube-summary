import asyncio
from datetime import datetime, timezone

from authx import AuthX, RequestToken
from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends, Request
from jose import jwt

from models.models import (
    UserCreate, Token, RefreshRequest, RegisterResponse,
    PasswordResetRequest, PasswordResetConfirm, UserType
)
from utils.config import settings
from utils.db import get_users_collection, get_user_by_username, get_user_by_id
from utils.mail import send_verification_email, send_password_reset_email
from utils.security import (
    hash_password, verify_password, create_confirmation_token,
    create_password_reset_token, authx_security
)
from utils.tasks import create_task_record, get_task_by_id
from workers.email_processor import process_email_task
from utils.rate_limit import limiter, RateLimits
from utils.usage_limits import initialize_user_limits


router = APIRouter()


@router.post('/register', response_model=RegisterResponse)
@limiter.limit(RateLimits.REGISTER)
async def register(request: Request, user: UserCreate):
    if await get_user_by_username(user.username):
        raise HTTPException(status_code=400, detail='User already exists')

    hashed = hash_password(user.password)
    created_at = datetime.now(timezone.utc)

    # Initialize usage limits for free user
    usage_limits = await initialize_user_limits(
        user_id=None,  # Will be set after insert
        user_type=UserType.free.value,
        created_at=created_at
    )

    # Create user document with usage limits
    user_doc = {
        'username': user.username,
        'hashed_password': hashed,
        'created_at': created_at,
        'email_confirmed': False,
        'user_type': UserType.free.value,
        **usage_limits  # Add summaries_used, summaries_limit, limit_reset_date
    }

    await get_users_collection().insert_one(user_doc)

    confirm_token = create_confirmation_token(user.username)
    verify_url = f'{settings.ROOT_URL}/verify-email/{confirm_token}'

    # Create email task for background processing
    email_data = {
        'email_type': 'verification',
        'email_address': user.username,
        'token': confirm_token
    }
    
    task_id = await create_task_record(
        user_id=user.username,  # Use username as user_id for registration
        task_type='email',
        email_data=email_data
    )
    
    # Start background email processing
    asyncio.create_task(process_email_task(task_id, email_data))

    return {'confirm_url': verify_url, 'email_task_id': task_id}

@router.post('/login', response_model=Token)
@limiter.limit(RateLimits.LOGIN)
async def login(request: Request, user: UserCreate):
    db_user = await get_user_by_username(user.username)

    if not db_user or not verify_password(user.password, db_user['hashed_password']):
        raise HTTPException(status_code=401, detail='Invalid credentials')
    
    if not db_user.get('email_confirmed'):
        raise HTTPException(status_code=403, detail='Email not confirmed')

    access = authx_security.create_access_token(str(db_user['_id']))
    refresh = authx_security.create_refresh_token(str(db_user['_id']))
    return {'access_token': access, 'refresh_token': refresh}


@router.post('/refresh', response_model=Token)
@limiter.limit("20/hour")
async def refresh_token(request: Request, request_data: RefreshRequest):
    try:
        token = RequestToken(token=request_data.refresh_token, location='json', type='refresh')
        payload = authx_security.verify_token(token, verify_type=True)
    except Exception:
        raise HTTPException(status_code=401, detail='Invalid refresh token')

    access = authx_security.create_access_token(payload.sub)
    refresh = authx_security.create_refresh_token(payload.sub)
    return {'access_token': access, 'refresh_token': refresh}


@router.post('/request-password-reset')
@limiter.limit(RateLimits.PASSWORD_RESET)
async def request_password_reset(request: Request, request_data: PasswordResetRequest):
    user = await get_user_by_username(request_data.username)
    
    if not user:
        # Don't reveal if user exists for security reasons
        return {'message': 'If the email exists, a password reset link has been sent'}
    
    if not user.get('email_confirmed'):
        raise HTTPException(status_code=400, detail='Email not confirmed. Please verify your email first.')
    
    reset_token = create_password_reset_token(request_data.username)
    
    # Create email task for background processing
    email_data = {
        'email_type': 'password_reset',
        'email_address': request_data.username,
        'token': reset_token
    }
    
    task_id = await create_task_record(
        user_id=str(user['_id']),  # Use actual user ID for password reset
        task_type='email',
        email_data=email_data
    )
    
    # Start background email processing
    asyncio.create_task(process_email_task(task_id, email_data))
    
    return {'message': 'If the email exists, a password reset link has been sent', 'email_task_id': task_id}


@router.post('/reset-password')
@limiter.limit(RateLimits.PASSWORD_RESET)
async def reset_password(request: Request, request_data: PasswordResetConfirm):
    try:
        payload = jwt.decode(request_data.token, authx_security.config.JWT_SECRET_KEY, algorithms=['HS256'])
        if payload.get('type') != 'password_reset':
            raise HTTPException(status_code=400, detail='Invalid token type')
    except Exception:
        raise HTTPException(status_code=400, detail='Invalid or expired token')
    
    user = await get_user_by_username(payload['sub'])
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    
    if not user.get('email_confirmed'):
        raise HTTPException(status_code=400, detail='Email not confirmed')
    
    hashed_password = hash_password(request_data.new_password)
    
    await get_users_collection().update_one(
        {'username': payload['sub']},
        {'$set': {'hashed_password': hashed_password, 'password_reset_at': datetime.now(timezone.utc)}}
    )
    
    return {'message': 'Password reset successfully'}


@router.get('/user')
async def get_user(user_data=Depends(authx_security.access_token_required)):
    '''Get current user information'''
    try:
        # Get user from database using the user ID from JWT token
        user = await get_user_by_id(user_data.sub)
        
        if not user:
            raise HTTPException(status_code=404, detail='User not found')
        
        return {
            'id': str(user['_id']),
            'username': user['username'],
            'email_confirmed': user.get('email_confirmed', False),
            'user_type': user.get('user_type', 'free')
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail='Failed to retrieve user information')


@router.post('/change-password')
@limiter.limit("10/hour")
async def change_password(
    request: Request,
    data: dict,
    user_data=Depends(authx_security.access_token_required)
):
    '''Change user password'''
    try:
        # Validate request data
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        
        if not current_password or not new_password:
            raise HTTPException(status_code=400, detail='Current password and new password are required')
        
        # Get user from database to verify current password
        user = await get_users_collection().find_one({'_id': ObjectId(user_data.sub)})
        
        if not user:
            raise HTTPException(status_code=404, detail='User not found')
        
        # Verify current password
        if not verify_password(current_password, user['hashed_password']):
            raise HTTPException(status_code=401, detail='Current password is incorrect')
        
        # Hash new password
        hashed_password = hash_password(new_password)
        
        # Update password in database
        await get_users_collection().update_one(
            {'_id': ObjectId(user_data.sub)},
            {'$set': {'hashed_password': hashed_password}}
        )
        
        return {'message': 'Password changed successfully'}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail='Failed to change password')
