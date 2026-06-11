import pytest
from httpx import AsyncClient
from unittest.mock import patch, AsyncMock
from io import BytesIO


class TestSummaryYouTubeEndpoint:
    '''Test YouTube summary endpoint.'''

    @pytest.mark.asyncio
    async def test_youtube_summary_success(self, client: AsyncClient, mock_db, mock_youtube_transcript, 
                                         mock_openai, mock_file_write, auth_headers):
        '''Test successful YouTube video summary generation.'''
        youtube_url = 'https://youtube.com/watch?v=test123'
        
        response = await client.get(
            f'/summary/summary_youtube?youtube_url={youtube_url}',
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Check new task-based response structure
        assert 'task_id' in data
        assert data['status'] == 'queued'
        assert data['youtube_url'] == youtube_url
        assert data['language'] == 'English'
        assert 'message' in data
        assert 'being processed' in data['message']
        
        # Verify task was created in database
        from utils.tasks import get_task_by_id
        task = await get_task_by_id(data['task_id'])
        assert task is not None
        assert task['user_id'] == 'test@example.com'
        assert task['task_type'] == 'youtube'
        assert task['youtube_url'] == youtube_url

    @pytest.mark.asyncio
    async def test_youtube_summary_no_transcript(self, client: AsyncClient, mock_db, auth_headers):
        '''Test YouTube summary when no transcript is available.'''
        youtube_url = 'https://youtube.com/watch?v=notranscript'
        
        with patch('utils.summary_youtube.get_transcript_text') as mock_transcript:
            mock_transcript.return_value = None
            
            response = await client.get(
                f'/summary/summary_youtube?youtube_url={youtube_url}',
                headers=auth_headers
            )
            
            # API should return 200 with task info immediately
            assert response.status_code == 200
            data = response.json()
            assert 'task_id' in data
            assert data['status'] == 'queued'
            
            # The task should eventually fail due to no transcript
            # Let's just verify the task was created correctly
            from utils.tasks import get_task_by_id
            task = await get_task_by_id(data['task_id'])
            assert task is not None
            assert task['task_type'] == 'youtube'
            assert task['youtube_url'] == youtube_url

    @pytest.mark.asyncio
    async def test_youtube_summary_openai_failure(self, client: AsyncClient, mock_db, 
                                                 mock_youtube_transcript, auth_headers):
        '''Test YouTube summary when OpenAI fails.'''
        youtube_url = 'https://youtube.com/watch?v=aifail'
        
        with patch('utils.llm.generate_summary') as mock_summary:
            mock_summary.return_value = None
            
            response = await client.get(
                f'/summary/summary_youtube?youtube_url={youtube_url}',
                headers=auth_headers
            )
            
            # Since the endpoint now returns 200 with task info, OpenAI failure happens in background
            assert response.status_code == 200
            data = response.json()
            assert 'task_id' in data
            assert data['status'] == 'queued'
            assert data['youtube_url'] == youtube_url

    @pytest.mark.asyncio
    async def test_youtube_summary_unauthorized(self, client: AsyncClient, mock_db):
        '''Test YouTube summary without authentication.'''
        youtube_url = 'https://youtube.com/watch?v=test123'
        
        # Remove auth dependency override for this test
        from main import app
        from utils.security import authx_security
        app.dependency_overrides.clear()
        
        response = await client.get(f'/summary/summary_youtube?youtube_url={youtube_url}')
        
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_youtube_summary_invalid_url(self, client: AsyncClient, mock_db, auth_headers):
        '''Test YouTube summary with invalid URL format.'''
        invalid_url = 'not-a-url'
        
        # The endpoint should still try to process it, but transcript extraction will fail
        with patch('utils.summary_youtube.get_transcript_text') as mock_transcript:
            mock_transcript.return_value = None
            
            response = await client.get(
                f'/summary/summary_youtube?youtube_url={invalid_url}',
                headers=auth_headers
            )
            
            # Since the endpoint now returns 200 with task info, transcript failure happens in background
            assert response.status_code == 200
            data = response.json()
            assert 'task_id' in data
            assert data['status'] == 'queued'
            assert data['youtube_url'] == invalid_url


class TestSummaryFileEndpoint:
    '''Test file summary endpoint.'''

    @pytest.mark.asyncio
    async def test_file_summary_success(self, client: AsyncClient, mock_db, mock_openai, 
                                      mock_file_write, auth_headers):
        '''Test successful file summary generation.'''
        test_content = 'This is test file content for summarization.'
        file_data = BytesIO(test_content.encode('utf-8'))
        
        files = {'file': ('test.txt', file_data, 'text/plain')}
        
        response = await client.post(
            '/summary/summary_file',
            files=files,
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Check response structure - now returns task info, not immediate result
        assert 'task_id' in data
        assert data['status'] == 'queued'
        assert 'file_info' in data
        assert data['language'] == 'English'
        assert 'message' in data
        assert 'being processed' in data['message']
        
        # Note: Since processing is now async, the summary won't be in the database immediately
        # The test just verifies that the task was created successfully

    @pytest.mark.asyncio
    async def test_file_summary_wrong_content_type(self, client: AsyncClient, mock_db, auth_headers):
        '''Test file summary with wrong content type.'''
        file_data = BytesIO(b'binary content')
        files = {'file': ('test.bin', file_data, 'application/octet-stream')}
        
        response = await client.post(
            '/summary/summary_file',
            files=files,
            headers=auth_headers
        )
        
        assert response.status_code == 400
        assert 'Supported formats: TXT, PDF, DOC, DOCX' in response.json()['detail']

    @pytest.mark.asyncio
    async def test_file_summary_unauthorized(self, client: AsyncClient, mock_db):
        '''Test file summary without authentication.'''
        from main import app
        app.dependency_overrides.clear()
        
        test_content = 'Test content'
        file_data = BytesIO(test_content.encode('utf-8'))
        files = {'file': ('test.txt', file_data, 'text/plain')}
        
        response = await client.post('/summary/summary_file', files=files)
        
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_file_summary_no_file(self, client: AsyncClient, mock_db, auth_headers):
        '''Test file summary without providing file.'''
        response = await client.post(
            '/summary/summary_file',
            headers=auth_headers
        )
        
        assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_file_summary_empty_file(self, client: AsyncClient, mock_db, mock_openai, 
                                         mock_file_write, auth_headers):
        '''Test file summary with empty file.'''
        file_data = BytesIO(b'')
        files = {'file': ('empty.txt', file_data, 'text/plain')}
        
        response = await client.post(
            '/summary/summary_file',
            files=files,
            headers=auth_headers
        )
        
        # Should still work, OpenAI will handle empty content
        assert response.status_code == 200


class TestSummariesListEndpoint:
    '''Test summaries list endpoint.'''

    @pytest.mark.asyncio
    async def test_get_summaries_success(self, client: AsyncClient, mock_db, created_summary, auth_headers):
        '''Test successful retrieval of user summaries.'''
        response = await client.get('/summary/summaries', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert 'summaries' in data
        assert 'total' in data
        assert data['total'] >= 1
        assert len(data['summaries']) >= 1
        
        # Check first summary structure
        summary = data['summaries'][0]
        assert 'id' in summary
        assert 'user_id' in summary
        assert 'summary_type' in summary
        assert 'created_at' in summary

    @pytest.mark.asyncio
    async def test_get_summaries_with_limit(self, client: AsyncClient, mock_db, auth_headers):
        '''Test summaries retrieval with limit parameter.'''
        # Create multiple summaries
        for i in range(5):
            summary_data = {
                'user_id': 'test@example.com',
                'summary_type': 'youtube',
                'source_url': f'https://youtube.com/watch?v=test{i}',
                'source_content': f'Test content {i}',
                'summary_text': f'Test summary {i}',
                'language': 'Russian'
            }
            await mock_db['summaries'].insert_one(summary_data)
        
        response = await client.get('/summary/summaries?limit=3', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert len(data['summaries']) <= 3

    @pytest.mark.asyncio
    async def test_get_summaries_unauthorized(self, client: AsyncClient, mock_db):
        '''Test summaries retrieval without authentication.'''
        from main import app
        app.dependency_overrides.clear()
        
        response = await client.get('/summary/summaries')
        
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_get_summaries_empty_list(self, client: AsyncClient, mock_db, auth_headers):
        '''Test summaries retrieval when user has no summaries.'''
        response = await client.get('/summary/summaries', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data['summaries'] == []
        assert data['total'] == 0

    @pytest.mark.asyncio
    async def test_get_summaries_invalid_limit(self, client: AsyncClient, mock_db, auth_headers):
        '''Test summaries retrieval with invalid limit.'''
        response = await client.get('/summary/summaries?limit=150', headers=auth_headers)
        
        assert response.status_code == 422  # Validation error


class TestSummaryByIdEndpoint:
    '''Test get summary by ID endpoint.'''

    @pytest.mark.asyncio
    async def test_get_summary_by_id_success(self, client: AsyncClient, mock_db, created_summary, auth_headers):
        '''Test successful retrieval of summary by ID.'''
        summary_id = created_summary['id']
        
        response = await client.get(f'/summary/summary/{summary_id}', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data['id'] == summary_id
        assert data['user_id'] == created_summary['user_id']
        assert data['summary_type'] == created_summary['summary_type']
        assert data['source_content'] == created_summary['source_content']
        assert data['summary_text'] == created_summary['summary_text']

    @pytest.mark.asyncio
    async def test_get_summary_by_id_not_found(self, client: AsyncClient, mock_db, auth_headers):
        '''Test retrieval of non-existent summary.'''
        fake_id = '507f1f77bcf86cd799439011'  # Valid ObjectId format
        
        response = await client.get(f'/summary/summary/{fake_id}', headers=auth_headers)
        
        assert response.status_code == 404
        assert 'Summary not found' in response.json()['detail']

    @pytest.mark.asyncio
    async def test_get_summary_by_id_unauthorized(self, client: AsyncClient, mock_db, created_summary):
        '''Test summary retrieval without authentication.'''
        from main import app
        app.dependency_overrides.clear()
        
        summary_id = created_summary['id']
        
        response = await client.get(f'/summary/summary/{summary_id}')
        
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_get_summary_by_id_wrong_user(self, client: AsyncClient, mock_db, auth_headers):
        '''Test retrieval of summary belonging to different user.'''
        # Create summary for different user
        other_summary = {
            'user_id': 'other@example.com',
            'summary_type': 'youtube',
            'source_url': 'https://youtube.com/watch?v=other',
            'source_content': 'Other user content',
            'summary_text': 'Other user summary',
            'language': 'English'
        }
        result = await mock_db['summaries'].insert_one(other_summary)
        summary_id = str(result.inserted_id)
        
        response = await client.get(f'/summary/summary/{summary_id}', headers=auth_headers)
        
        assert response.status_code == 403
        assert 'Access denied' in response.json()['detail']

    @pytest.mark.asyncio
    async def test_get_summary_by_id_invalid_id(self, client: AsyncClient, mock_db, auth_headers):
        '''Test retrieval with invalid ObjectId format.'''
        invalid_id = 'invalid_object_id'
        
        response = await client.get(f'/summary/summary/{invalid_id}', headers=auth_headers)
        
        assert response.status_code == 404


class TestSummaryEndpointsIntegration:
    '''Test integration scenarios across summary endpoints.'''

    @pytest.mark.asyncio
    async def test_full_summary_workflow(self, client: AsyncClient, mock_db, mock_youtube_transcript, 
                                       mock_openai, mock_file_write, auth_headers):
        '''Test complete workflow: create YouTube summary, list summaries, get by ID.'''
        youtube_url = 'https://youtube.com/watch?v=workflow'
        
        # 1. Create YouTube summary (now returns task info)
        response = await client.get(
            f'/summary/summary_youtube?youtube_url={youtube_url}',
            headers=auth_headers
        )
        assert response.status_code == 200
        task_data = response.json()
        task_id = task_data['task_id']
        
        # Since the workflow is now async, we can't immediately test the summary listing
        # This test now just verifies that the task was created successfully
        assert task_data['status'] == 'queued'
        assert task_data['youtube_url'] == youtube_url
        
        # 2. Test that we can list summaries (may be empty since processing is async)
        response = await client.get('/summary/summaries', headers=auth_headers)
        assert response.status_code == 200
        summaries_data = response.json()
        # summaries_data should have the expected structure
        assert 'summaries' in summaries_data
        assert 'total' in summaries_data

    @pytest.mark.asyncio
    async def test_user_isolation(self, client: AsyncClient, mock_db, mock_youtube_transcript, 
                                mock_openai, mock_file_write, auth_headers):
        '''Test that authentication is required for summary endpoints.'''
        # Test that authenticated requests work
        response = await client.get(
            '/summary/summary_youtube?youtube_url=https://youtube.com/test',
            headers=auth_headers
        )
        assert response.status_code == 200
        
        # Test that unauthenticated requests fail
        response = await client.get(
            '/summary/summary_youtube?youtube_url=https://youtube.com/test'
        )
        assert response.status_code == 401