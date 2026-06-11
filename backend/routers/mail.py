import asyncio
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Request
from jose import jwt

from models.models import ResendEmailRequest
from utils.config import settings
from utils.db import get_users_collection, get_user_by_username
from utils.mail import send_verification_email
from utils.security import authx_security, create_confirmation_token
from utils.tasks import create_task_record
from workers.email_processor import process_email_task
from utils.rate_limit import limiter, RateLimits


router = APIRouter()


@router.post('/resend-confirmation')
@limiter.limit(RateLimits.RESEND_EMAIL)
async def resend_confirmation_email(request: Request, data: ResendEmailRequest):
    user = await get_user_by_username(data.username)

    if not user:
        raise HTTPException(status_code=404, detail='User not found')

    if user.get('email_confirmed'):
        raise HTTPException(status_code=400, detail='Email already confirmed')

    confirm_token = create_confirmation_token(data.username)
    verify_url = f'{settings.ROOT_URL}/mail/verify/{confirm_token}'
    
    # Create email task for background processing
    email_data = {
        'email_type': 'verification',
        'email_address': data.username,
        'token': confirm_token
    }
    
    task_id = await create_task_record(
        user_id=str(user['_id']),  # Use actual user ID for resend
        task_type='email',
        email_data=email_data
    )
    
    # Start background email processing
    asyncio.create_task(process_email_task(task_id, email_data))
    
    return {'confirm_url': verify_url, 'email_task_id': task_id}


@router.post('/verify/{token}')
@limiter.limit(RateLimits.EMAIL_VERIFY)
async def verify_email(request: Request, token: str):
    try:
        payload = jwt.decode(token, authx_security.config.JWT_SECRET_KEY, algorithms=['HS256'])
        if payload.get('type') != 'confirm':
            raise HTTPException(status_code=400, detail='Invalid token type')
    except Exception:
        raise HTTPException(status_code=400, detail='Invalid token')

    user = await get_user_by_username(payload['sub'])
    if not user:
        raise HTTPException(status_code=404, detail='User not found')

    if user.get('email_confirmed'):
        raise HTTPException(status_code=200, detail='Email already confirmed')

    await get_users_collection().update_one(
        {'username': payload['sub']},
        {'$set': {'email_confirmed': datetime.now(timezone.utc)}},
    )
    return {'message': 'Email verified successfully'}