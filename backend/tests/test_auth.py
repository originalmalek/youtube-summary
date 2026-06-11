import pytest
from httpx import AsyncClient
from unittest.mock import patch, AsyncMock


class TestAuthEndpoints:
    '''Test authentication endpoints.'''

    @pytest.mark.asyncio
    async def test_register_success(self, client: AsyncClient, mock_db, mock_email_service):
        '''Test successful user registration.'''
        user_data = {
            'username': 'newuser@example.com',
            'password': 'newpassword123'
        }
        
        with patch('utils.config.settings.ROOT_URL', 'http://test'):
            response = await client.post('/auth/register', json=user_data)
            
            assert response.status_code == 200
            data = response.json()
            assert 'confirm_url' in data
            assert 'email_task_id' in data
            assert data['confirm_url'].startswith('http://test/verify-email/')
            
            # Verify task was created in database
            from utils.tasks import get_task_by_id
            task = await get_task_by_id(data['email_task_id'])
            assert task is not None
            assert task['task_type'] == 'email'
            assert task['email_data']['email_type'] == 'verification'
            assert task['email_data']['email_address'] == user_data['username']
            
            # Check user was created in database
            user = await mock_db['users'].find_one({'username': user_data['username']})
            assert user is not None
            assert user['username'] == user_data['username']
            assert user['email_confirmed'] is False

    @pytest.mark.asyncio
    async def test_register_duplicate_user(self, client: AsyncClient, mock_db, created_user):
        '''Test registration with existing username.'''
        user_data = {
            'username': created_user['username'],
            'password': 'anotherpassword123'
        }
        
        response = await client.post('/auth/register', json=user_data)
        
        assert response.status_code == 400
        assert 'already exists' in response.json()['detail']

    @pytest.mark.asyncio
    async def test_register_invalid_email(self, client: AsyncClient, mock_db):
        '''Test registration with invalid email.'''
        user_data = {
            'username': 'not-an-email',
            'password': 'password123'
        }
        
        response = await client.post('/auth/register', json=user_data)
        
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_login_success(self, client: AsyncClient, mock_db, created_user, test_user_data):
        '''Test successful login.'''
        # Update user to be confirmed
        await mock_db['users'].update_one(
            {'username': created_user['username']},
            {'$set': {'email_confirmed': True}}
        )
        
        response = await client.post('/auth/login', json=test_user_data)
        
        assert response.status_code == 200
        data = response.json()
        assert 'access_token' in data
        assert 'refresh_token' in data
        # Verify tokens are non-empty strings
        assert isinstance(data['access_token'], str)
        assert isinstance(data['refresh_token'], str)
        assert len(data['access_token']) > 0
        assert len(data['refresh_token']) > 0

    @pytest.mark.asyncio
    async def test_login_wrong_password(self, client: AsyncClient, mock_db, created_user):
        '''Test login with wrong password.'''
        user_data = {
            'username': created_user['username'],
            'password': 'wrongpassword'
        }
        
        response = await client.post('/auth/login', json=user_data)
        
        assert response.status_code == 401
        assert 'Invalid credentials' in response.json()['detail']

    @pytest.mark.asyncio
    async def test_login_unconfirmed_user(self, client: AsyncClient, mock_db, test_user_data):
        '''Test login with unconfirmed user.'''
        # Create unconfirmed user
        from passlib.context import CryptContext
        from datetime import datetime, timezone
        
        pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
        hashed_password = pwd_context.hash(test_user_data['password'])
        
        user_doc = {
            'username': 'unconfirmed@example.com',
            'hashed_password': hashed_password,
            'created_at': datetime.now(timezone.utc),
            'email_confirmed': False
        }
        
        await mock_db['users'].insert_one(user_doc)
        
        login_data = {
            'username': 'unconfirmed@example.com',
            'password': test_user_data['password']
        }
        
        response = await client.post('/auth/login', json=login_data)
        
        assert response.status_code == 403
        assert 'Email not confirmed' in response.json()['detail']

    @pytest.mark.asyncio
    async def test_login_nonexistent_user(self, client: AsyncClient, mock_db):
        '''Test login with non-existent user.'''
        user_data = {
            'username': 'nonexistent@example.com',
            'password': 'password123'
        }
        
        response = await client.post('/auth/login', json=user_data)
        
        assert response.status_code == 401
        assert 'Invalid credentials' in response.json()['detail']

    @pytest.mark.asyncio
    async def test_refresh_token_success(self, client: AsyncClient, mock_jwt_token, mock_db):
        '''Test successful token refresh.'''
        # Create a valid refresh token using authx
        from utils.security import authx_security
        from bson import ObjectId
        
        user_id = str(ObjectId())
        refresh_token = authx_security.create_refresh_token(user_id)
        
        refresh_data = {
            'refresh_token': refresh_token
        }
        
        response = await client.post('/auth/refresh', json=refresh_data)
        
        assert response.status_code == 200
        data = response.json()
        assert 'access_token' in data
        assert 'refresh_token' in data
        assert isinstance(data['access_token'], str)
        assert isinstance(data['refresh_token'], str)

    @pytest.mark.asyncio
    async def test_refresh_token_invalid(self, client: AsyncClient):
        '''Test token refresh with invalid token.'''
        refresh_data = {
            'refresh_token': 'invalid_refresh_token'
        }
        
        response = await client.post('/auth/refresh', json=refresh_data)
        
        assert response.status_code == 401
        assert 'Invalid refresh token' in response.json()['detail']

    @pytest.mark.asyncio
    async def test_refresh_token_missing(self, client: AsyncClient):
        '''Test token refresh with missing token.'''
        response = await client.post('/auth/refresh', json={})
        
        assert response.status_code == 422  # Validation error


class TestAuthValidation:
    '''Test authentication data validation.'''

    @pytest.mark.asyncio
    async def test_register_missing_password(self, client: AsyncClient):
        '''Test registration without password.'''
        user_data = {
            'username': 'test@example.com'
        }
        
        response = await client.post('/auth/register', json=user_data)
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_register_missing_username(self, client: AsyncClient):
        '''Test registration without username.'''
        user_data = {
            'password': 'password123'
        }
        
        response = await client.post('/auth/register', json=user_data)
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_login_missing_fields(self, client: AsyncClient):
        '''Test login with missing fields.'''
        # Missing password
        response = await client.post('/auth/login', json={'username': 'test@example.com'})
        assert response.status_code == 422
        
        # Missing username
        response = await client.post('/auth/login', json={'password': 'password123'})
        assert response.status_code == 422
        
        # Empty body
        response = await client.post('/auth/login', json={})
        assert response.status_code == 422


class TestPasswordReset:
    '''Test password reset functionality.'''
    
    @pytest.mark.asyncio
    async def test_request_password_reset_success(self, client: AsyncClient, mock_db, created_user, mock_email_service):
        '''Test successful password reset request.'''
        # Update user to be confirmed
        await mock_db['users'].update_one(
            {'username': created_user['username']},
            {'$set': {'email_confirmed': True}}
        )
        
        request_data = {
            'username': created_user['username']
        }
        
        with patch('utils.security.create_password_reset_token') as mock_token:
            mock_token.return_value = 'test_reset_token'
            
            response = await client.post('/auth/request-password-reset', json=request_data)
            
            assert response.status_code == 200
            data = response.json()
            assert 'message' in data
            assert 'email_task_id' in data
            assert 'password reset link has been sent' in data['message']
            
            # Verify task was created in database
            from utils.tasks import get_task_by_id
            task = await get_task_by_id(data['email_task_id'])
            assert task is not None
            assert task['task_type'] == 'email'
            assert task['email_data']['email_type'] == 'password_reset'
            assert task['email_data']['email_address'] == created_user['username']
    
    @pytest.mark.asyncio
    async def test_request_password_reset_unconfirmed_user(self, client: AsyncClient, mock_db, created_user):
        '''Test password reset request for unconfirmed user.'''
        # Ensure user is not confirmed
        await mock_db['users'].update_one(
            {'username': created_user['username']},
            {'$set': {'email_confirmed': False}}
        )
        
        request_data = {
            'username': created_user['username']
        }
        
        response = await client.post('/auth/request-password-reset', json=request_data)
        
        assert response.status_code == 400
        assert 'Email not confirmed' in response.json()['detail']
    
    @pytest.mark.asyncio
    async def test_request_password_reset_nonexistent_user(self, client: AsyncClient, mock_db):
        '''Test password reset request for non-existent user.'''
        request_data = {
            'username': 'nonexistent@example.com'
        }
        
        response = await client.post('/auth/request-password-reset', json=request_data)
        
        # Should still return 200 for security reasons
        assert response.status_code == 200
        data = response.json()
        assert 'message' in data
        assert 'password reset link has been sent' in data['message']
        # Should not have email_task_id for non-existent user
        assert 'email_task_id' not in data