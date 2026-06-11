'''
Authentication-related test fixtures and utilities
'''
import pytest
from datetime import datetime, timezone, timedelta
from typing import Dict, Any
from bson import ObjectId
from faker import Faker

from utils.security import hash_password, authx_security, create_confirmation_token
from jose import jwt


fake = Faker()


class AuthTestHelper:
    '''Helper class for authentication testing'''
    
    @staticmethod
    def create_test_user_data() -> Dict[str, str]:
        '''Generate test user data'''
        return {
            'username': fake.email(),
            'password': fake.password(length=12, special_chars=True, digits=True)
        }
    
    @staticmethod
    async def create_user_in_db(users_collection, username: str, password: str, confirmed: bool = False) -> Dict[str, Any]:
        '''Create a user in the test database'''
        user_id = ObjectId()
        user_data = {
            '_id': user_id,
            'username': username,
            'hashed_password': hash_password(password),
            'created_at': datetime.now(timezone.utc),
            'email_confirmed': datetime.now(timezone.utc) if confirmed else False
        }
        
        await users_collection.insert_one(user_data)
        
        return {
            'id': str(user_id),
            'username': username,
            'password': password,
            'email_confirmed': confirmed
        }
    
    @staticmethod
    def create_access_token(user_id: str, expired: bool = False) -> str:
        '''Create an access token for testing'''
        if expired:
            exp = datetime.now(timezone.utc) - timedelta(hours=1)
            payload = {
                'sub': user_id,
                'type': 'access',
                'exp': exp,
                'iat': datetime.now(timezone.utc) - timedelta(hours=2)
            }
            return jwt.encode(payload, authx_security.config.JWT_SECRET_KEY, algorithm='HS256')
        else:
            return authx_security.create_access_token(user_id)
    
    @staticmethod
    def create_refresh_token(user_id: str, expired: bool = False) -> str:
        '''Create a refresh token for testing'''
        if expired:
            exp = datetime.now(timezone.utc) - timedelta(hours=1)
            payload = {
                'sub': user_id,
                'type': 'refresh',
                'exp': exp,
                'iat': datetime.now(timezone.utc) - timedelta(hours=2)
            }
            return jwt.encode(payload, authx_security.config.JWT_SECRET_KEY, algorithm='HS256')
        else:
            return authx_security.create_refresh_token(user_id)
    
    @staticmethod
    def create_confirmation_token(username: str, expired: bool = False) -> str:
        '''Create a confirmation token for testing'''
        if expired:
            exp = datetime.now(timezone.utc) - timedelta(hours=1)
            payload = {
                'sub': username,
                'type': 'confirm',
                'exp': exp,
                'iat': datetime.now(timezone.utc) - timedelta(hours=2)
            }
            return jwt.encode(payload, authx_security.config.JWT_SECRET_KEY, algorithm='HS256')
        else:
            return create_confirmation_token(username)
    
    @staticmethod
    def get_auth_headers(token: str) -> Dict[str, str]:
        '''Get authorization headers with Bearer token'''
        return {'Authorization': f'Bearer {token}'}


# Additional fixtures for specific scenarios
@pytest.fixture
def auth_helper():
    '''Provide the auth helper class'''
    return AuthTestHelper


@pytest.fixture
async def multiple_users(mock_mongodb):
    '''Create multiple test users for testing user isolation'''
    users = []
    for i in range(3):
        user_data = AuthTestHelper.create_test_user_data()
        user = await AuthTestHelper.create_user_in_db(
            mock_mongodb['users'],
            user_data['username'],
            user_data['password'],
            confirmed=True
        )
        users.append(user)
    
    return users


@pytest.fixture
async def user_with_summaries(mock_mongodb, confirmed_user):
    '''Create a user with multiple summaries for testing'''
    # Create 5 summaries for the user
    for i in range(5):
        summary_data = {
            '_id': ObjectId(),
            'user_id': confirmed_user['id'],
            'summary_type': 'youtube' if i % 2 == 0 else 'file',
            'source_url': f'https://youtube.com/watch?v={i}' if i % 2 == 0 else None,
            'source_content': f'Content for summary {i}',
            'summary_text': f'This is summary number {i}',
            'language': 'Russian',
            'created_at': datetime.now(timezone.utc)
        }
        await mock_mongodb['summaries'].insert_one(summary_data)
    
    return confirmed_user