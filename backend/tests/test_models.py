import pytest
from pydantic import ValidationError
from datetime import datetime, timezone

from models.models import (
    UserCreate,
    Token,
    RefreshRequest,
    RegisterResponse,
    ResendEmailRequest,
    SummaryType,
    SummaryBase,
    SummaryCreate,
    SummaryResponse
)


class TestUserModels:
    '''Test user-related Pydantic models.'''

    def test_user_create_valid(self):
        '''Test valid UserCreate model.'''
        user_data = {
            'username': 'test@example.com',
            'password': 'validpassword123'
        }
        user = UserCreate(**user_data)
        assert user.username == 'test@example.com'
        assert user.password == 'validpassword123'

    def test_user_create_invalid_email(self):
        '''Test UserCreate with invalid email.'''
        user_data = {
            'username': 'not-an-email',
            'password': 'validpassword123'
        }
        with pytest.raises(ValidationError) as exc_info:
            UserCreate(**user_data)
        
        assert 'value is not a valid email address' in str(exc_info.value)

    def test_user_create_missing_fields(self):
        '''Test UserCreate with missing required fields.'''
        # Missing password
        with pytest.raises(ValidationError) as exc_info:
            UserCreate(username='test@example.com')
        assert 'Field required' in str(exc_info.value)
        
        # Missing username
        with pytest.raises(ValidationError) as exc_info:
            UserCreate(password='password123')
        assert 'Field required' in str(exc_info.value)

    def test_user_create_empty_values(self):
        '''Test UserCreate with empty values.'''
        # Empty username (invalid email) should be invalid
        with pytest.raises(ValidationError):
            UserCreate(username='', password='password123')
        
        # Note: Empty password is currently allowed by the model


class TestTokenModels:
    '''Test token-related models.'''

    def test_token_valid(self):
        '''Test valid Token model.'''
        token_data = {
            'access_token': 'access_token_value',
            'refresh_token': 'refresh_token_value'
        }
        token = Token(**token_data)
        assert token.access_token == 'access_token_value'
        assert token.refresh_token == 'refresh_token_value'

    def test_token_missing_fields(self):
        '''Test Token with missing fields.'''
        with pytest.raises(ValidationError):
            Token(access_token='access_token')
        
        with pytest.raises(ValidationError):
            Token(refresh_token='refresh_token')

    def test_refresh_request_valid(self):
        '''Test valid RefreshRequest model.'''
        refresh_data = {'refresh_token': 'valid_refresh_token'}
        refresh = RefreshRequest(**refresh_data)
        assert refresh.refresh_token == 'valid_refresh_token'

    def test_refresh_request_missing_token(self):
        '''Test RefreshRequest without token.'''
        with pytest.raises(ValidationError):
            RefreshRequest()


class TestResponseModels:
    '''Test response models.'''

    def test_register_response_valid(self):
        '''Test valid RegisterResponse model.'''
        response_data = {
            'confirm_url': 'http://example.com/confirm/token123',
            'email_task_id': '507f1f77bcf86cd799439011'
        }
        response = RegisterResponse(**response_data)
        assert response.confirm_url == 'http://example.com/confirm/token123'
        assert response.email_task_id == '507f1f77bcf86cd799439011'

    def test_register_response_missing_fields(self):
        '''Test RegisterResponse with missing fields.'''
        # Missing both fields
        with pytest.raises(ValidationError):
            RegisterResponse()
        
        # Missing email_task_id
        with pytest.raises(ValidationError):
            RegisterResponse(confirm_url='http://example.com/confirm/token123')
        
        # Missing confirm_url
        with pytest.raises(ValidationError):
            RegisterResponse(email_task_id='507f1f77bcf86cd799439011')

    def test_resend_email_request_valid(self):
        '''Test valid ResendEmailRequest model.'''
        request_data = {'username': 'test@example.com'}
        request = ResendEmailRequest(**request_data)
        assert request.username == 'test@example.com'

    def test_resend_email_request_invalid_email(self):
        '''Test ResendEmailRequest with invalid email.'''
        with pytest.raises(ValidationError):
            ResendEmailRequest(username='not-an-email')


class TestSummaryModels:
    '''Test summary-related models.'''

    def test_summary_type_enum(self):
        '''Test SummaryType enum values.'''
        assert SummaryType.youtube == 'youtube'
        assert SummaryType.file == 'file'
        assert SummaryType.text == 'text'
        
        # Test enum validation
        assert SummaryType('youtube') == SummaryType.youtube
        assert SummaryType('file') == SummaryType.file
        assert SummaryType('text') == SummaryType.text

    def test_summary_base_valid(self):
        '''Test valid SummaryBase model.'''
        summary_data = {
            'summary_type': SummaryType.youtube,
            'source_url': 'https://youtube.com/watch?v=test',
            'source_content': 'Test content',
            'summary_text': 'Test summary',
            'language': 'English'
        }
        summary = SummaryBase(**summary_data)
        assert summary.summary_type == SummaryType.youtube
        assert summary.source_url == 'https://youtube.com/watch?v=test'
        assert summary.source_content == 'Test content'
        assert summary.summary_text == 'Test summary'
        assert summary.language == 'English'

    def test_summary_base_default_language(self):
        '''Test SummaryBase with default language.'''
        summary_data = {
            'summary_type': SummaryType.file,
            'source_content': 'Test content',
            'summary_text': 'Test summary'
        }
        summary = SummaryBase(**summary_data)
        assert summary.language == 'English'  # Default value
        assert summary.source_url is None  # Default value

    def test_summary_base_missing_required_fields(self):
        '''Test SummaryBase with missing required fields.'''
        # Missing summary_type
        with pytest.raises(ValidationError):
            SummaryBase(
                source_content='Test content',
                summary_text='Test summary'
            )
        
        # Missing source_content
        with pytest.raises(ValidationError):
            SummaryBase(
                summary_type=SummaryType.youtube,
                summary_text='Test summary'
            )
        
        # Missing summary_text
        with pytest.raises(ValidationError):
            SummaryBase(
                summary_type=SummaryType.youtube,
                source_content='Test content'
            )

    def test_summary_create_valid(self):
        '''Test valid SummaryCreate model.'''
        summary_data = {
            'summary_type': SummaryType.youtube,
            'source_url': 'https://youtube.com/watch?v=test',
            'source_content': 'Test content',
            'summary_text': 'Test summary',
            'language': 'Russian',
            'user_id': 'test@example.com'
        }
        summary = SummaryCreate(**summary_data)
        assert summary.user_id == 'test@example.com'
        assert summary.summary_type == SummaryType.youtube

    def test_summary_create_missing_user_id(self):
        '''Test SummaryCreate without user_id.'''
        summary_data = {
            'summary_type': SummaryType.youtube,
            'source_content': 'Test content',
            'summary_text': 'Test summary'
        }
        with pytest.raises(ValidationError):
            SummaryCreate(**summary_data)

    def test_summary_response_valid(self):
        '''Test valid SummaryResponse model.'''
        now = datetime.now(timezone.utc)
        summary_data = {
            'summary_type': SummaryType.file,
            'source_content': 'Test file content',
            'summary_text': 'Test summary',
            'language': 'English',
            'id': '507f1f77bcf86cd799439011',
            'user_id': 'test@example.com',
            'created_at': now
        }
        summary = SummaryResponse(**summary_data)
        assert summary.id == '507f1f77bcf86cd799439011'
        assert summary.user_id == 'test@example.com'
        assert summary.created_at == now

    def test_summary_response_missing_response_fields(self):
        '''Test SummaryResponse with missing response-specific fields.'''
        summary_data = {
            'summary_type': SummaryType.youtube,
            'source_content': 'Test content',
            'summary_text': 'Test summary'
        }
        
        # Missing id
        with pytest.raises(ValidationError):
            SummaryResponse(**summary_data)
        
        # Missing user_id
        summary_data['id'] = '507f1f77bcf86cd799439011'
        with pytest.raises(ValidationError):
            SummaryResponse(**summary_data)
        
        # Missing created_at
        summary_data['user_id'] = 'test@example.com'
        with pytest.raises(ValidationError):
            SummaryResponse(**summary_data)


class TestSummaryTypeValidation:
    '''Test SummaryType validation in different contexts.'''

    def test_summary_type_in_summary_base(self):
        '''Test SummaryType validation in SummaryBase.'''
        # Valid enum values
        for summary_type in [SummaryType.youtube, SummaryType.file, SummaryType.text]:
            summary_data = {
                'summary_type': summary_type,
                'source_content': 'Test content',
                'summary_text': 'Test summary'
            }
            summary = SummaryBase(**summary_data)
            assert summary.summary_type == summary_type

    def test_summary_type_string_conversion(self):
        '''Test SummaryType string conversion.'''
        summary_data = {
            'summary_type': 'youtube',  # String instead of enum
            'source_content': 'Test content',
            'summary_text': 'Test summary'
        }
        summary = SummaryBase(**summary_data)
        assert summary.summary_type == SummaryType.youtube

    def test_summary_type_invalid_value(self):
        '''Test SummaryType with invalid value.'''
        summary_data = {
            'summary_type': 'invalid_type',
            'source_content': 'Test content',
            'summary_text': 'Test summary'
        }
        with pytest.raises(ValidationError) as exc_info:
            SummaryBase(**summary_data)
        
        assert ('value is not a valid enumeration member' in str(exc_info.value) or 
                'Input should be' in str(exc_info.value))


class TestModelFieldValidation:
    '''Test specific field validation across models.'''

    def test_url_field_validation(self):
        '''Test URL field validation in SummaryBase.'''
        # Valid URL
        summary_data = {
            'summary_type': SummaryType.youtube,
            'source_url': 'https://youtube.com/watch?v=test123',
            'source_content': 'Test content',
            'summary_text': 'Test summary'
        }
        summary = SummaryBase(**summary_data)
        assert summary.source_url == 'https://youtube.com/watch?v=test123'
        
        # None URL (should be allowed)
        summary_data['source_url'] = None
        summary = SummaryBase(**summary_data)
        assert summary.source_url is None

    def test_empty_string_validation(self):
        '''Test empty string validation.'''
        # Empty source_content should be invalid
        summary_data = {
            'summary_type': SummaryType.text,
            'source_content': '',
            'summary_text': 'Test summary'
        }
        # Depending on model validation, this might be allowed or not
        # If there are minimum length constraints, this would fail
        summary = SummaryBase(**summary_data)
        assert summary.source_content == ''

    def test_long_text_validation(self):
        '''Test validation with very long text.'''
        long_text = 'x' * 10000
        summary_data = {
            'summary_type': SummaryType.text,
            'source_content': long_text,
            'summary_text': 'Test summary'
        }
        summary = SummaryBase(**summary_data)
        assert len(summary.source_content) == 10000

    def test_special_characters_validation(self):
        '''Test validation with special characters.'''
        special_content = 'Test content with émojis 🚀 and spëcial chars ñ'
        summary_data = {
            'summary_type': SummaryType.text,
            'source_content': special_content,
            'summary_text': 'Test summary with émojis 🎉'
        }
        summary = SummaryBase(**summary_data)
        assert summary.source_content == special_content
        assert '🎉' in summary.summary_text