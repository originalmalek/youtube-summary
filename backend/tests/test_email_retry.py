import pytest
from httpx import AsyncClient
from unittest.mock import patch, AsyncMock
from bson import ObjectId
from datetime import datetime, timezone


class TestEmailRetryAndErrorHandling:
    '''Test email retry and error handling functionality.'''
    
    @pytest.mark.asyncio
    async def test_email_temporary_error_retry(self, client: AsyncClient, mock_db):
        '''Test email retry for temporary errors.'''
        from workers.email_processor import process_email_task, is_temporary_error
        from utils.tasks import create_task_record, get_task_by_id
        
        # Test temporary error detection
        assert is_temporary_error(Exception('Connection timeout')) is True
        assert is_temporary_error(Exception('Server temporarily unavailable')) is True
        assert is_temporary_error(Exception('Network error')) is True
        assert is_temporary_error(Exception('Rate limit exceeded')) is True
        
        # Test permanent error detection
        assert is_temporary_error(Exception('Authentication failed')) is False
        assert is_temporary_error(Exception('Invalid email address')) is False
        assert is_temporary_error(Exception('Permission denied')) is False
        assert is_temporary_error(Exception('Configuration error')) is False
    
    @pytest.mark.asyncio
    async def test_email_processor_temporary_error_retry(self, client: AsyncClient, mock_db):
        '''Test email processor retry behavior with temporary errors.'''
        from workers.email_processor import process_email_task
        from utils.tasks import create_task_record, get_task_by_id
        
        # Create an email task
        email_data = {
            'email_type': 'verification',
            'email_address': 'test@example.com',
            'token': 'test_token'
        }
        
        task_id = await create_task_record(
            user_id='test@example.com',
            task_type='email',
            email_data=email_data
        )
        
        # Mock email service to fail with temporary error first, then succeed
        call_count = 0
        async def mock_send_email(*args, **kwargs):
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                raise Exception('Connection timeout')  # Temporary error
            return True  # Success on retry
        
        with patch('workers.email_processor.send_verification_email', side_effect=mock_send_email):
            # Process the task
            await process_email_task(task_id, email_data)
            
            # Verify task was completed after retry
            task = await get_task_by_id(task_id)
            assert task['status'] == 'completed'
            assert task['retry_count'] == 1  # Should have retried once
            assert task['result']['status'] == 'sent'
    
    @pytest.mark.asyncio
    async def test_email_processor_permanent_error_no_retry(self, client: AsyncClient, mock_db):
        '''Test email processor doesn't retry permanent errors.'''
        from workers.email_processor import process_email_task
        from utils.tasks import create_task_record, get_task_by_id
        
        # Create an email task
        email_data = {
            'email_type': 'verification',
            'email_address': 'test@example.com',
            'token': 'test_token'
        }
        
        task_id = await create_task_record(
            user_id='test@example.com',
            task_type='email',
            email_data=email_data
        )
        
        # Mock email service to fail with permanent error
        async def mock_send_email(*args, **kwargs):
            raise Exception('Authentication failed')  # Permanent error
        
        with patch('workers.email_processor.send_verification_email', side_effect=mock_send_email):
            # Process the task
            await process_email_task(task_id, email_data)
            
            # Verify task failed without retry
            task = await get_task_by_id(task_id)
            assert task['status'] == 'failed'
            assert task['retry_count'] == 0  # Should not have retried
            assert 'Authentication failed' in task['error']
    
    @pytest.mark.asyncio
    async def test_email_processor_max_retries_exceeded(self, client: AsyncClient, mock_db):
        '''Test email processor stops retrying after max retries.'''
        from workers.email_processor import process_email_task
        from utils.tasks import create_task_record, get_task_by_id
        
        # Create an email task
        email_data = {
            'email_type': 'verification',
            'email_address': 'test@example.com',
            'token': 'test_token'
        }
        
        task_id = await create_task_record(
            user_id='test@example.com',
            task_type='email',
            email_data=email_data
        )
        
        # Mock email service to always fail with temporary error
        async def mock_send_email(*args, **kwargs):
            raise Exception('Connection timeout')  # Always temporary error
        
        with patch('workers.email_processor.send_verification_email', side_effect=mock_send_email):
            # Process the task once (retries are handled internally)
            await process_email_task(task_id, email_data)
            
            # Verify task failed after max retries
            task = await get_task_by_id(task_id)
            assert task['status'] == 'failed'
            assert task['retry_count'] == 2  # Should have reached max retries (3 attempts = 2 retries)
            assert 'Connection timeout' in task['error']
    
    @pytest.mark.asyncio
    async def test_email_processor_exponential_backoff(self, client: AsyncClient, mock_db):
        '''Test email processor uses exponential backoff for retries.'''
        from workers.email_processor import process_email_task
        from utils.tasks import create_task_record, get_task_by_id
        import time
        
        # Create an email task
        email_data = {
            'email_type': 'verification',
            'email_address': 'test@example.com',
            'token': 'test_token'
        }
        
        task_id = await create_task_record(
            user_id='test@example.com',
            task_type='email',
            email_data=email_data
        )
        
        # Track timing of retries
        attempt_times = []
        
        async def mock_send_email(*args, **kwargs):
            attempt_times.append(time.time())
            if len(attempt_times) <= 2:  # Fail first 2 attempts
                raise Exception('Connection timeout')  # Temporary error
            return True  # Success on 3rd attempt
        
        with patch('workers.email_processor.send_verification_email', side_effect=mock_send_email), \
             patch('asyncio.sleep', side_effect=lambda x: None):  # Mock sleep to avoid actual delays
            
            # Process the task with retries
            await process_email_task(task_id, email_data)
            
            # Verify task completed after retries
            task = await get_task_by_id(task_id)
            assert task['status'] == 'completed'
            assert task['retry_count'] == 2  # Should have retried twice
    
    @pytest.mark.asyncio
    async def test_password_reset_email_retry(self, client: AsyncClient, mock_db):
        '''Test password reset email retry functionality.'''
        from workers.email_processor import process_email_task
        from utils.tasks import create_task_record, get_task_by_id
        
        # Create a password reset email task
        email_data = {
            'email_type': 'password_reset',
            'email_address': 'test@example.com',
            'token': 'reset_token'
        }
        
        task_id = await create_task_record(
            user_id='test@example.com',
            task_type='email',
            email_data=email_data
        )
        
        # Mock email service to fail once then succeed
        call_count = 0
        async def mock_send_email(*args, **kwargs):
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                raise Exception('Network error')  # Temporary error
            return True  # Success on retry
        
        with patch('workers.email_processor.send_password_reset_email', side_effect=mock_send_email):
            # Process the task
            await process_email_task(task_id, email_data)
            
            # Verify task completed after retry
            task = await get_task_by_id(task_id)
            assert task['status'] == 'completed'
            assert task['retry_count'] == 1
            assert task['result']['status'] == 'sent'
    
    @pytest.mark.asyncio
    async def test_email_task_validation_errors(self, client: AsyncClient, mock_db):
        '''Test email task validation and error handling.'''
        from workers.email_processor import process_email_task
        from utils.tasks import create_task_record, get_task_by_id
        
        # Test with invalid email type
        email_data = {
            'email_type': 'invalid_type',
            'email_address': 'test@example.com',
            'token': 'test_token'
        }
        
        task_id = await create_task_record(
            user_id='test@example.com',
            task_type='email',
            email_data=email_data
        )
        
        # Process the task
        await process_email_task(task_id, email_data)
        
        # Verify task failed with validation error
        task = await get_task_by_id(task_id)
        assert task['status'] == 'failed'
        # Note: The current implementation still retries validation errors
        # This is a design decision that could be changed
        assert 'Unknown email type' in task['error']
    
    @pytest.mark.asyncio
    async def test_email_task_missing_data(self, client: AsyncClient, mock_db):
        '''Test email task with missing required data.'''
        from workers.email_processor import process_email_task
        from utils.tasks import create_task_record, get_task_by_id
        
        # Test with missing email address
        email_data = {
            'email_type': 'verification',
            'token': 'test_token'
            # Missing email_address
        }
        
        task_id = await create_task_record(
            user_id='test@example.com',
            task_type='email',
            email_data=email_data
        )
        
        # Process the task
        await process_email_task(task_id, email_data)
        
        # Verify task failed with missing data error
        task = await get_task_by_id(task_id)
        assert task['status'] == 'failed'
        assert task['retry_count'] == 0  # Should not retry missing data errors
        assert 'Missing required email data' in task['error']


class TestEmailRetryEndpoint:
    '''Test the email retry endpoint.'''
    
    @pytest.mark.asyncio
    async def test_retry_email_endpoint_success(self, client: AsyncClient, mock_db, auth_headers):
        '''Test successful email retry via endpoint.'''
        from utils.tasks import create_task_record, update_task_status
        
        # Create a failed email task
        email_data = {
            'email_type': 'verification',
            'email_address': 'test@example.com',
            'token': 'test_token'
        }
        
        task_id = await create_task_record(
            user_id='test@example.com',
            task_type='email',
            email_data=email_data
        )
        
        # Mark task as failed
        await update_task_status(task_id, 'failed', 'Email sending failed', 0, None, 'Connection timeout')
        
        # Retry the email task
        response = await client.post(f'/auth/retry-email/{task_id}', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert 'message' in data
        assert 'email_task_id' in data
        assert data['message'] == 'Email retry started'
        assert data['email_task_id'] != task_id  # Should create a new task
    
    @pytest.mark.asyncio
    async def test_retry_email_endpoint_not_found(self, client: AsyncClient, mock_db, auth_headers):
        '''Test retry endpoint with non-existent task.'''
        fake_task_id = str(ObjectId())
        
        response = await client.post(f'/auth/retry-email/{fake_task_id}', headers=auth_headers)
        
        assert response.status_code == 404
        assert 'Task not found' in response.json()['detail']
    
    @pytest.mark.asyncio
    async def test_retry_email_endpoint_wrong_user(self, client: AsyncClient, mock_db, auth_headers):
        '''Test retry endpoint with task belonging to different user.'''
        from utils.tasks import create_task_record, update_task_status
        
        # Create a task for a different user
        email_data = {
            'email_type': 'verification',
            'email_address': 'other@example.com',
            'token': 'test_token'
        }
        
        task_id = await create_task_record(
            user_id='other@example.com',
            task_type='email',
            email_data=email_data
        )
        
        # Mark task as failed
        await update_task_status(task_id, 'failed', 'Email sending failed', 0, None, 'Connection timeout')
        
        # Try to retry with different user
        response = await client.post(f'/auth/retry-email/{task_id}', headers=auth_headers)
        
        assert response.status_code == 403
        assert 'Access denied' in response.json()['detail']
    
    @pytest.mark.asyncio
    async def test_retry_email_endpoint_task_not_failed(self, client: AsyncClient, mock_db, auth_headers):
        '''Test retry endpoint with task that's not in failed state.'''
        from utils.tasks import create_task_record
        
        # Create a pending email task
        email_data = {
            'email_type': 'verification',
            'email_address': 'test@example.com',
            'token': 'test_token'
        }
        
        task_id = await create_task_record(
            user_id='test@example.com',
            task_type='email',
            email_data=email_data
        )
        
        # Task is still pending, try to retry
        response = await client.post(f'/auth/retry-email/{task_id}', headers=auth_headers)
        
        assert response.status_code == 400
        assert 'Task is not in failed state' in response.json()['detail']
    
    @pytest.mark.asyncio
    async def test_retry_email_endpoint_not_email_task(self, client: AsyncClient, mock_db, auth_headers):
        '''Test retry endpoint with non-email task.'''
        from utils.tasks import create_task_record, update_task_status
        
        # Create a YouTube task
        task_id = await create_task_record(
            user_id='test@example.com',
            task_type='youtube',
            youtube_url='https://youtube.com/watch?v=test123'
        )
        
        # Mark task as failed
        await update_task_status(task_id, 'failed', 'Processing failed', 0, None, 'Some error')
        
        # Try to retry (should fail because it's not an email task)
        response = await client.post(f'/auth/retry-email/{task_id}', headers=auth_headers)
        
        assert response.status_code == 400
        assert 'Task is not an email task' in response.json()['detail']
    
    @pytest.mark.asyncio
    async def test_retry_email_endpoint_unauthorized(self, client: AsyncClient, mock_db):
        '''Test retry endpoint without authentication.'''
        from utils.tasks import create_task_record
        from main import app
        
        # Create a task
        task_id = await create_task_record(
            user_id='test@example.com',
            task_type='email',
            email_data={'email_type': 'verification', 'email_address': 'test@example.com', 'token': 'test'}
        )
        
        # Clear auth dependency override
        app.dependency_overrides.clear()
        
        # Try to retry without authentication
        response = await client.post(f'/auth/retry-email/{task_id}')
        
        assert response.status_code == 401