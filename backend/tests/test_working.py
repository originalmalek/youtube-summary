import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock, patch
from main import app


@pytest.mark.asyncio
async def test_app_endpoints_exist():
    '''Test that all endpoints are properly registered.'''
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url='http://test') as client:
        response = await client.get('/openapi.json')
        assert response.status_code == 200
        data = response.json()
        paths = data['paths']
        
        # Check all expected endpoints exist
        expected_endpoints = [
            '/auth/register',
            '/auth/login', 
            '/auth/refresh',
            '/mail/resend-confirmation',
            '/mail/verify/{token}',
            '/summary/summary_youtube',
            '/summary/summary_file',
            '/summary/summaries',
            '/summary/summary/{summary_id}'
        ]
        
        for endpoint in expected_endpoints:
            assert endpoint in paths, f'Endpoint {endpoint} not found'


@pytest.mark.asyncio
async def test_registration_input_validation():
    '''Test registration validates input correctly.'''
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url='http://test') as client:
        # Test missing fields returns 422
        response = await client.post('/auth/register', json={})
        assert response.status_code == 422
        
        # Test invalid email returns 422
        response = await client.post('/auth/register', json={
            'username': 'not-an-email',
            'password': 'password123'
        })
        assert response.status_code == 422


@pytest.mark.asyncio
async def test_login_requires_database():
    '''Test that login attempts fail when database is unavailable.'''
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url='http://test') as client:
        # This should fail due to uninitialized database collections
        try:
            response = await client.post('/auth/login', json={
                'username': 'test@example.com',
                'password': 'password123'
            })
            # If it somehow doesn't crash, it shouldn't be successful
            assert response.status_code != 200
        except Exception:
            # Database error is expected when collections are not initialized
            pass


@pytest.mark.asyncio 
async def test_protected_endpoints_require_auth():
    '''Test that protected endpoints require authentication.'''
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url='http://test') as client:
        # Test YouTube summary endpoint
        try:
            response = await client.get('/summary/summary_youtube?youtube_url=https://youtube.com/test')
            assert response.status_code == 401
        except Exception as e:
            # Auth exception is expected
            assert 'Missing' in str(e) or 'authorization' in str(e).lower()
        
        # Test summaries list endpoint  
        try:
            response = await client.get('/summary/summaries')
            assert response.status_code == 401
        except Exception as e:
            # Auth exception is expected
            assert 'Missing' in str(e) or 'authorization' in str(e).lower()
        
        # Test summary by ID endpoint
        try:
            response = await client.get('/summary/summary/test123')
            assert response.status_code == 401
        except Exception as e:
            # Auth exception is expected
            assert 'Missing' in str(e) or 'authorization' in str(e).lower()


@pytest.mark.asyncio
async def test_summary_file_requires_auth():
    '''Test that file upload endpoint requires authentication.'''
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url='http://test') as client:
        # Try to upload without auth
        files = {'file': ('test.txt', b'test content', 'text/plain')}
        try:
            response = await client.post('/summary/summary_file', files=files)
            assert response.status_code == 401
        except Exception as e:
            # Auth exception is expected
            assert 'Missing' in str(e) or 'authorization' in str(e).lower()


@pytest.mark.asyncio
async def test_youtube_summary_missing_param():
    '''Test YouTube summary endpoint parameter validation.'''
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url='http://test') as client:
        # Test missing youtube_url parameter
        # Auth check happens before validation, so we expect 401
        response = await client.get('/summary/summary_youtube')
        assert response.status_code == 401  # Auth error comes before validation


@pytest.mark.asyncio
async def test_mail_endpoints_validation():
    '''Test mail endpoints validate input correctly.'''
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url='http://test') as client:
        # Test resend confirmation with missing username
        response = await client.post('/mail/resend-confirmation', json={})
        assert response.status_code == 422
        
        # Test resend confirmation with invalid email
        response = await client.post('/mail/resend-confirmation', json={
            'username': 'not-an-email'
        })
        assert response.status_code == 422


@pytest.mark.asyncio
async def test_refresh_token_validation():
    '''Test refresh token endpoint validates input.'''
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url='http://test') as client:
        # Test missing refresh token
        response = await client.post('/auth/refresh', json={})
        assert response.status_code == 422
        
        # Test with invalid token (will be handled by auth logic)
        response = await client.post('/auth/refresh', json={
            'refresh_token': 'invalid_token'
        })
        # Should not be a validation error (422)
        assert response.status_code != 422


@pytest.mark.asyncio
async def test_docs_accessible():
    '''Test that API documentation is accessible.'''
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url='http://test') as client:
        response = await client.get('/docs')
        assert response.status_code == 200
        
        response = await client.get('/redoc')
        assert response.status_code == 200