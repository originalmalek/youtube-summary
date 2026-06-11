import pytest
import pytest_asyncio
import asyncio
from httpx import AsyncClient
from mongomock_motor import AsyncMongoMockClient
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch
import warnings

# Suppress warnings during testing
warnings.filterwarnings('ignore', category=DeprecationWarning)

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set TESTING environment variable to disable rate limiting
os.environ["TESTING"] = "true"

from main import app
from models.models import UserCreate, SummaryType


@pytest.fixture(scope='session')
def event_loop():
    '''Create an instance of the default event loop for the test session.'''
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture
async def mock_db():
    '''Mock MongoDB database for testing.'''
    mock_client = AsyncMongoMockClient()
    mock_database = mock_client.test_database
    mock_users_collection = mock_database.users
    mock_summaries_collection = mock_database.summaries
    mock_tasks_collection = mock_database.processing_tasks
    
    async def mock_get_user_by_username(username: str):
        return await mock_users_collection.find_one({'username': username})
    
    async def mock_get_user_by_id(user_id: str):
        from bson import ObjectId
        try:
            return await mock_users_collection.find_one({'_id': ObjectId(user_id)})
        except Exception:
            return None
    
    with patch('utils.db.client', mock_client), \
         patch('utils.db.db', mock_database), \
         patch('utils.db.users_collection', mock_users_collection), \
         patch('utils.db.summaries_collection', mock_summaries_collection), \
         patch('utils.db.get_users_collection', lambda: mock_users_collection), \
         patch('utils.db.get_summaries_collection', lambda: mock_summaries_collection), \
         patch('utils.db.get_user_by_username', mock_get_user_by_username), \
         patch('utils.db.get_user_by_id', mock_get_user_by_id), \
         patch('utils.tasks.get_database', lambda: mock_database), \
         patch('utils.security.authx_security.config.JWT_SECRET_KEY', 'test_secret_key_for_testing'):
        yield {
            'client': mock_client,
            'db': mock_database,
            'users': mock_users_collection,
            'summaries': mock_summaries_collection,
            'tasks': mock_tasks_collection
        }


@pytest_asyncio.fixture
async def client():
    '''Create test client.'''
    from httpx import AsyncClient, ASGITransport
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url='http://test') as ac:
        yield ac


@pytest.fixture
def test_user_data():
    '''Test user data.'''
    return {
        'username': 'test@example.com',
        'password': 'testpassword123'
    }


@pytest_asyncio.fixture
async def created_user(mock_db, test_user_data):
    '''Create a test user in the mock database.'''
    from passlib.context import CryptContext
    from datetime import datetime, timezone
    
    pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
    hashed_password = pwd_context.hash(test_user_data['password'])
    
    user_doc = {
        'username': test_user_data['username'],
        'hashed_password': hashed_password,
        'created_at': datetime.now(timezone.utc),
        'email_confirmed': True  # Pre-confirmed for easier testing
    }
    
    result = await mock_db['users'].insert_one(user_doc)
    user_doc['_id'] = result.inserted_id
    
    return user_doc


@pytest.fixture
def mock_jwt_token():
    '''Mock JWT token for testing.'''
    # Create a valid JWT token for testing
    from jose import jwt
    from datetime import datetime, timezone, timedelta
    
    payload = {
        'sub': 'test@example.com',
        'exp': datetime.now(timezone.utc) + timedelta(hours=1),
        'iat': datetime.now(timezone.utc),
        'type': 'access'
    }
    
    # Use a simple secret for testing
    secret = 'test_secret_key_for_testing'
    token = jwt.encode(payload, secret, algorithm='HS256')
    
    return token


@pytest.fixture
def mock_auth_dependency():
    '''Mock authentication dependency.'''
    class MockUserData:
        def __init__(self, sub='test@example.com'):
            self.sub = sub
    
    return MockUserData()


@pytest.fixture
def auth_headers(mock_jwt_token):
    '''Create authorization headers.'''
    return {'Authorization': f'Bearer {mock_jwt_token}'}


@pytest.fixture
def test_summary_data():
    '''Test summary data.'''
    from models.models import SummaryStatus
    return {
        'user_id': 'test@example.com',
        'summary_type': SummaryType.youtube,
        'source_url': 'https://youtube.com/watch?v=test',
        'source_content': 'This is test transcript content for YouTube video.',
        'summary_text': 'This is a test summary of the YouTube video content.',
        'language': 'Russian',
        'status': SummaryStatus.active
    }


@pytest_asyncio.fixture
async def created_summary(mock_db, test_summary_data):
    '''Create a test summary in the mock database.'''
    from datetime import datetime, timezone
    
    summary_doc = test_summary_data.copy()
    summary_doc['created_at'] = datetime.now(timezone.utc)
    
    result = await mock_db['summaries'].insert_one(summary_doc)
    summary_doc['_id'] = result.inserted_id
    summary_doc['id'] = str(result.inserted_id)
    
    return summary_doc


@pytest.fixture
def mock_openai():
    '''Mock OpenAI API calls.'''
    with patch('utils.llm.llm') as mock_llm:
        mock_response = AsyncMock()
        mock_response.content = 'This is a mocked summary from OpenAI'
        mock_llm.ainvoke.return_value = mock_response
        yield mock_llm


@pytest.fixture
def mock_youtube_transcript():
    '''Mock YouTube transcript API.'''
    with patch('utils.summary_youtube.get_transcript_text') as mock_transcript:
        mock_transcript.return_value = 'This is a mocked YouTube transcript'
        yield mock_transcript


@pytest.fixture
def mock_email_service():
    '''Mock email service.'''
    with patch('utils.mail.send_email') as mock_send:
        mock_send.return_value = True
        yield mock_send


@pytest.fixture
def mock_file_write():
    '''Mock file writing operations.'''
    with patch('builtins.open'), patch('utils.llm.open'):
        yield


# Override security dependency for testing
@pytest.fixture(autouse=True)
def override_auth_dependency(mock_auth_dependency):
    '''Override auth dependency for all tests.'''
    def override_get_current_user():
        return mock_auth_dependency
    
    # Import and override auth dependency
    from utils.security import authx_security
    app.dependency_overrides[authx_security.access_token_required] = override_get_current_user
    
    yield
    app.dependency_overrides.clear()