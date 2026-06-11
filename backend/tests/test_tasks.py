import pytest
from httpx import AsyncClient
from unittest.mock import patch, AsyncMock
from bson import ObjectId
from datetime import datetime, timezone


class TestTaskStatusAndTracking:
    '''Test task status and tracking functionality.'''
    
    @pytest.mark.asyncio
    async def test_task_creation_and_retrieval(self, client: AsyncClient, mock_db):
        '''Test creating and retrieving a task.'''
        from utils.tasks import create_task_record, get_task_by_id
        
        # Create a task
        task_id = await create_task_record(
            user_id='test@example.com',
            task_type='youtube',
            youtube_url='https://youtube.com/watch?v=test123',
            language='English'
        )
        
        assert task_id is not None
        assert isinstance(task_id, str)
        
        # Retrieve the task
        task = await get_task_by_id(task_id)
        
        assert task is not None
        assert task['user_id'] == 'test@example.com'
        assert task['task_type'] == 'youtube'
        assert task['youtube_url'] == 'https://youtube.com/watch?v=test123'
        assert task['language'] == 'English'
        assert task['status'] == 'pending'
        assert task['progress'] == 0
        assert task['result'] is None
        assert task['error'] is None
        assert task['retry_count'] == 0
        assert task['max_retries'] == 1
        assert 'created_at' in task
        assert 'updated_at' in task
    
    @pytest.mark.asyncio
    async def test_task_status_update(self, client: AsyncClient, mock_db):
        '''Test updating task status.'''
        from utils.tasks import create_task_record, update_task_status, get_task_by_id
        
        # Create a task
        task_id = await create_task_record(
            user_id='test@example.com',
            task_type='youtube',
            youtube_url='https://youtube.com/watch?v=test123'
        )
        
        # Update task status to processing
        await update_task_status(task_id, 'processing', 'Extracting transcript', 30)
        
        # Retrieve and verify
        task = await get_task_by_id(task_id)
        assert task['status'] == 'processing'
        assert task['current_step'] == 'Extracting transcript'
        assert task['progress'] == 30
        
        # Update to completed
        result = {'summary_text': 'Test summary', 'source_url': 'https://youtube.com/watch?v=test123'}
        await update_task_status(task_id, 'completed', 'Summary generated', 100, result)
        
        # Retrieve and verify
        task = await get_task_by_id(task_id)
        assert task['status'] == 'completed'
        assert task['current_step'] == 'Summary generated'
        assert task['progress'] == 100
        assert task['result'] == result
    
    @pytest.mark.asyncio
    async def test_task_error_handling(self, client: AsyncClient, mock_db):
        '''Test task error handling.'''
        from utils.tasks import create_task_record, update_task_status, get_task_by_id
        
        # Create a task
        task_id = await create_task_record(
            user_id='test@example.com',
            task_type='youtube',
            youtube_url='https://youtube.com/watch?v=test123'
        )
        
        # Update task with error
        error_msg = 'Failed to extract transcript'
        await update_task_status(task_id, 'failed', 'Error occurred', 0, None, error_msg)
        
        # Retrieve and verify
        task = await get_task_by_id(task_id)
        assert task['status'] == 'failed'
        assert task['current_step'] == 'Error occurred'
        assert task['error'] == error_msg
        assert task['result'] is None
    
    @pytest.mark.asyncio
    async def test_email_task_creation(self, client: AsyncClient, mock_db):
        '''Test creating email tasks with retry functionality.'''
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
        
        # Retrieve and verify
        task = await get_task_by_id(task_id)
        assert task['task_type'] == 'email'
        assert task['email_data'] == email_data
        assert task['max_retries'] == 3  # Email tasks have higher retry limit
        assert task['retry_count'] == 0
    
    @pytest.mark.asyncio
    async def test_retry_task_functionality(self, client: AsyncClient, mock_db):
        '''Test task retry functionality.'''
        from utils.tasks import create_task_record, increment_retry_count, should_retry_task, get_task_by_id
        
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
        
        # Test retry functionality
        task = await get_task_by_id(task_id)
        assert await should_retry_task(task_id) is True
        
        # Increment retry count
        await increment_retry_count(task_id)
        task = await get_task_by_id(task_id)
        assert task['retry_count'] == 1
        assert await should_retry_task(task_id) is True
        
        # Increment to max retries
        await increment_retry_count(task_id)
        await increment_retry_count(task_id)
        task = await get_task_by_id(task_id)
        assert task['retry_count'] == 3
        assert await should_retry_task(task_id) is False
    
    @pytest.mark.asyncio
    async def test_task_nonexistent_retrieval(self, client: AsyncClient, mock_db):
        '''Test retrieving non-existent task.'''
        from utils.tasks import get_task_by_id
        
        fake_task_id = str(ObjectId())
        task = await get_task_by_id(fake_task_id)
        assert task is None
    
    @pytest.mark.asyncio
    async def test_file_task_creation(self, client: AsyncClient, mock_db):
        '''Test creating file processing tasks.'''
        from utils.tasks import create_task_record, get_task_by_id
        
        # Create a file task
        file_info = {
            'filename': 'test.txt',
            'content': 'This is test file content',
            'content_type': 'text/plain'
        }
        
        task_id = await create_task_record(
            user_id='test@example.com',
            task_type='file',
            file_info=file_info,
            language='Russian'
        )
        
        # Retrieve and verify
        task = await get_task_by_id(task_id)
        assert task['task_type'] == 'file'
        assert task['file_info']['content'] == 'This is test file content'
        assert task['language'] == 'Russian'
        assert task['max_retries'] == 1  # File tasks have lower retry limit
    
    @pytest.mark.asyncio
    async def test_task_progress_tracking(self, client: AsyncClient, mock_db):
        '''Test task progress tracking through multiple steps.'''
        from utils.tasks import create_task_record, update_task_status, get_task_by_id
        
        # Create a task
        task_id = await create_task_record(
            user_id='test@example.com',
            task_type='youtube',
            youtube_url='https://youtube.com/watch?v=test123'
        )
        
        # Track progress through multiple steps
        steps = [
            ('queued', 'Task queued for processing', 0),
            ('processing', 'Extracting transcript', 25),
            ('processing', 'Generating summary', 50),
            ('processing', 'Finalizing', 75),
            ('completed', 'Summary generated', 100)
        ]
        
        for status, step, progress in steps:
            await update_task_status(task_id, status, step, progress)
            
            task = await get_task_by_id(task_id)
            assert task['status'] == status
            assert task['current_step'] == step
            assert task['progress'] == progress
    
    @pytest.mark.asyncio
    async def test_task_timestamps(self, client: AsyncClient, mock_db):
        '''Test task timestamp tracking.'''
        from utils.tasks import create_task_record, update_task_status, get_task_by_id
        import time
        
        # Create a task
        task_id = await create_task_record(
            user_id='test@example.com',
            task_type='youtube',
            youtube_url='https://youtube.com/watch?v=test123'
        )
        
        # Get initial timestamps
        task = await get_task_by_id(task_id)
        created_at = task['created_at']
        updated_at = task['updated_at']
        
        # Wait a bit and update
        time.sleep(0.1)
        await update_task_status(task_id, 'processing', 'Working', 50)
        
        # Check timestamps
        task = await get_task_by_id(task_id)
        assert task['created_at'] == created_at  # Should remain unchanged
        assert task['updated_at'] > updated_at  # Should be updated


class TestTaskStatusEndpoint:
    '''Test task status API endpoint.'''
    
    @pytest.mark.asyncio
    async def test_task_status_endpoint_success(self, client: AsyncClient, mock_db, auth_headers):
        '''Test successful task status retrieval.'''
        from utils.tasks import create_task_record
        
        # Create a task
        task_id = await create_task_record(
            user_id='test@example.com',
            task_type='youtube',
            youtube_url='https://youtube.com/watch?v=test123'
        )
        
        # Get task status via API
        response = await client.get(f'/summary/task/{task_id}/status', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data['task_id'] == task_id
        assert data['status'] == 'pending'
        assert data['progress'] == 0
        assert 'created_at' in data
        assert 'updated_at' in data
    
    @pytest.mark.asyncio
    async def test_task_status_endpoint_not_found(self, client: AsyncClient, mock_db, auth_headers):
        '''Test task status endpoint with non-existent task.'''
        fake_task_id = str(ObjectId())
        
        response = await client.get(f'/summary/task/{fake_task_id}/status', headers=auth_headers)
        
        assert response.status_code == 404
        assert 'Task not found' in response.json()['detail']
    
    @pytest.mark.asyncio
    async def test_task_status_endpoint_unauthorized(self, client: AsyncClient, mock_db):
        '''Test task status endpoint without authentication.'''
        from utils.tasks import create_task_record
        
        # Create a task
        task_id = await create_task_record(
            user_id='test@example.com',
            task_type='youtube',
            youtube_url='https://youtube.com/watch?v=test123'
        )
        
        # Clear auth dependency override for this test
        from main import app
        from utils.security import authx_security
        app.dependency_overrides.clear()
        
        # Try to access without authentication
        response = await client.get(f'/summary/task/{task_id}/status')
        
        # Should get 401 because of missing authentication
        assert response.status_code == 401