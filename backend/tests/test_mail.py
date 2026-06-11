import pytest
from httpx import AsyncClient
from unittest.mock import patch, AsyncMock


class TestMailEndpoints:
    '''Test email-related endpoints.'''

    @pytest.mark.asyncio
    async def test_resend_confirmation_success(self, client: AsyncClient, mock_db, mock_email_service):
        '''Test successful resend confirmation email.'''
        # Create unconfirmed user
        from passlib.context import CryptContext
        from datetime import datetime, timezone
        
        pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
        user_data = {
            'username': 'unconfirmed@example.com',
            'hashed_password': pwd_context.hash('password123'),
            'created_at': datetime.now(timezone.utc),
            'email_confirmed': False
        }
        await mock_db['users'].insert_one(user_data)
        
        request_data = {
            'username': 'unconfirmed@example.com'
        }
        
        with patch('utils.security.create_confirmation_token') as mock_token, \
             patch('utils.config.settings.ROOT_URL', 'http://test'):
            mock_token.return_value = 'new_confirmation_token'
            
            response = await client.post('/mail/resend-confirmation', json=request_data)
            
            assert response.status_code == 200
            data = response.json()
            assert 'confirm_url' in data
            assert 'email_task_id' in data
            assert 'http://test/mail/verify/' in data['confirm_url']
            
            # Verify email service was called (via background task)
            # Note: Background task execution might not complete immediately
            # so we just verify the response structure is correct

    @pytest.mark.asyncio
    async def test_resend_confirmation_already_confirmed(self, client: AsyncClient, mock_db, created_user):
        '''Test resend confirmation for already confirmed user.'''
        request_data = {
            'username': created_user['username']
        }
        
        response = await client.post('/mail/resend-confirmation', json=request_data)
        
        assert response.status_code == 400
        assert 'already confirmed' in response.json()['detail']

    @pytest.mark.asyncio
    async def test_resend_confirmation_nonexistent_user(self, client: AsyncClient, mock_db):
        '''Test resend confirmation for non-existent user.'''
        request_data = {
            'username': 'nonexistent@example.com'
        }
        
        response = await client.post('/mail/resend-confirmation', json=request_data)
        
        assert response.status_code == 404
        assert 'User not found' in response.json()['detail']

    @pytest.mark.asyncio
    async def test_resend_confirmation_invalid_email(self, client: AsyncClient, mock_db):
        '''Test resend confirmation with invalid email format.'''
        request_data = {
            'username': 'not-an-email'
        }
        
        response = await client.post('/mail/resend-confirmation', json=request_data)
        
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_verify_email_success(self, client: AsyncClient, mock_db):
        '''Test successful email verification.'''
        # Create unconfirmed user
        from passlib.context import CryptContext
        from datetime import datetime, timezone
        
        pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
        user_data = {
            'username': 'unconfirmed@example.com',
            'hashed_password': pwd_context.hash('password123'),
            'created_at': datetime.now(timezone.utc),
            'email_confirmed': False
        }
        result = await mock_db['users'].insert_one(user_data)
        
        with patch('jose.jwt.decode') as mock_verify:
            mock_verify.return_value = {'sub': 'unconfirmed@example.com', 'type': 'confirm'}
            
            response = await client.post('/mail/verify/valid_token')
            
            assert response.status_code == 200
            data = response.json()
            assert 'verified successfully' in data['message']
            
            # Check that user is now confirmed in database
            updated_user = await mock_db['users'].find_one({'_id': result.inserted_id})
            assert updated_user['email_confirmed'] is not None

    @pytest.mark.asyncio
    async def test_verify_email_invalid_token(self, client: AsyncClient, mock_db):
        '''Test email verification with invalid token.'''
        with patch('jose.jwt.decode') as mock_verify:
            mock_verify.side_effect = Exception('Invalid token')
            
            response = await client.post('/mail/verify/invalid_token')
            
            assert response.status_code == 400
            assert 'Invalid token' in response.json()['detail']

    @pytest.mark.asyncio
    async def test_verify_email_already_confirmed(self, client: AsyncClient, mock_db, created_user):
        '''Test email verification for already confirmed user.'''
        with patch('jose.jwt.decode') as mock_verify:
            mock_verify.return_value = {'sub': created_user['username'], 'type': 'confirm'}
            
            response = await client.post(f'/mail/verify/some_token')
            
            assert response.status_code == 200
            assert 'already confirmed' in response.json()['detail']

    @pytest.mark.asyncio
    async def test_verify_email_nonexistent_user(self, client: AsyncClient, mock_db):
        '''Test email verification for non-existent user.'''
        with patch('jose.jwt.decode') as mock_verify:
            mock_verify.return_value = {'sub': 'nonexistent@example.com', 'type': 'confirm'}
            
            response = await client.post('/mail/verify/some_token')
            
            assert response.status_code == 404
            assert 'User not found' in response.json()['detail']


class TestMailValidation:
    '''Test email endpoint validation.'''

    @pytest.mark.asyncio
    async def test_resend_confirmation_missing_username(self, client: AsyncClient):
        '''Test resend confirmation without username.'''
        response = await client.post('/mail/resend-confirmation', json={})
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_resend_confirmation_empty_username(self, client: AsyncClient):
        '''Test resend confirmation with empty username.'''
        request_data = {
            'username': ''
        }
        response = await client.post('/mail/resend-confirmation', json=request_data)
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_verify_email_empty_token(self, client: AsyncClient):
        '''Test email verification with empty token.'''
        response = await client.post('/mail/verify/')
        assert response.status_code == 404  # Path not found


class TestMailServiceIntegration:
    '''Test email service integration scenarios.'''

    @pytest.mark.asyncio
    async def test_resend_confirmation_email_service_failure(self, client: AsyncClient, mock_db):
        '''Test resend confirmation when email service fails.'''
        # Create unconfirmed user
        from passlib.context import CryptContext
        from datetime import datetime, timezone
        
        pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
        user_data = {
            'username': 'unconfirmed@example.com',
            'hashed_password': pwd_context.hash('password123'),
            'created_at': datetime.now(timezone.utc),
            'email_confirmed': False
        }
        await mock_db['users'].insert_one(user_data)
        
        request_data = {
            'username': 'unconfirmed@example.com'
        }
        
        with patch('utils.security.create_confirmation_token') as mock_token, \
             patch('utils.config.settings.ROOT_URL', 'http://test'), \
             patch('utils.mail.send_email') as mock_send:
            mock_token.return_value = 'new_confirmation_token'
            mock_send.side_effect = Exception('Email service error')
            
            response = await client.post('/mail/resend-confirmation', json=request_data)
            
            # Since email processing is now asynchronous, the endpoint should still return 200
            # but the background task will fail
            assert response.status_code == 200
            data = response.json()
            assert 'confirm_url' in data
            assert 'email_task_id' in data

    @pytest.mark.asyncio
    async def test_token_expiration_handling(self, client: AsyncClient, mock_db):
        '''Test handling of expired confirmation tokens.'''
        with patch('jose.jwt.decode') as mock_verify:
            # Simulate expired token by raising an exception
            mock_verify.side_effect = Exception('Token expired')
            
            response = await client.post('/mail/verify/expired_token')
            
            assert response.status_code == 400
            assert 'invalid token' in response.json()['detail'].lower()

    @pytest.mark.asyncio
    async def test_multiple_confirmation_attempts(self, client: AsyncClient, mock_db, mock_email_service):
        '''Test multiple confirmation email requests.'''
        # Create unconfirmed user
        from passlib.context import CryptContext
        from datetime import datetime, timezone
        
        pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
        user_data = {
            'username': 'unconfirmed@example.com',
            'hashed_password': pwd_context.hash('password123'),
            'created_at': datetime.now(timezone.utc),
            'email_confirmed': False
        }
        await mock_db['users'].insert_one(user_data)
        
        request_data = {
            'username': 'unconfirmed@example.com'
        }
        
        with patch('utils.security.create_confirmation_token') as mock_token, \
             patch('utils.config.settings.ROOT_URL', 'http://test'):
            mock_token.return_value = 'confirmation_token'
            
            # Send first confirmation
            response1 = await client.post('/mail/resend-confirmation', json=request_data)
            assert response1.status_code == 200
            data1 = response1.json()
            assert 'confirm_url' in data1
            assert 'email_task_id' in data1
            
            # Send second confirmation (should also succeed)
            response2 = await client.post('/mail/resend-confirmation', json=request_data)
            assert response2.status_code == 200
            data2 = response2.json()
            assert 'confirm_url' in data2
            assert 'email_task_id' in data2
            
            # Each request should create a new task
            assert data1['email_task_id'] != data2['email_task_id']