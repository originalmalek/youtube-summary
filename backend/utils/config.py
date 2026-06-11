import os
from dotenv import load_dotenv
from urllib.parse import quote_plus


load_dotenv()

class Settings:
    if os.getenv('MODE') == 'DEV':
        MONGODB_URL: str = os.getenv('MONGODB_TEST_URL')
        ROOT_URL: str = os.getenv('ROOT_TEST_URL')

    else:
        MONGODB_URL: str = os.getenv('MONGODB_URL')
        if MONGODB_URL and '<PASSWORD>' in MONGODB_URL:
            MONGODB_PASSWORD = os.getenv('MONGODB_PASSWORD')
            if MONGODB_PASSWORD:
                ENCODED_MONGODB_PASSWORD: str = quote_plus(MONGODB_PASSWORD)
                MONGODB_URL: str = MONGODB_URL.replace("<PASSWORD>", ENCODED_MONGODB_PASSWORD)
        ROOT_URL: str = os.getenv('ROOT_URL')

    DATABASE_NAME: str = os.getenv('MONGODB_NAME', 'youtube_summary')

    # Security
    SECRET_KEY: str = os.getenv('SECRET_KEY')
    JWT_SECRET_KEY: str = os.getenv('JWT_SECRET_KEY')
    
    # OpenAI
    OPENAI_API_KEY: str = os.getenv('OPENAI_API_KEY')
    OPENAI_MODEL_NAME: str = os.getenv('OPENAI_MODEL_NAME', 'gpt-4o-mini')
    
    # YouTube Data API
    YOUTUBE_DATA_API_KEY: str = os.getenv('YOUTUBE_DATA_API_KEY')
    
    # Email
    MAIL_CONSOLE: bool = os.getenv('MAIL_CONSOLE', 'false').lower() == 'true'
    MAIL_USERNAME: str = os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD: str = os.getenv('MAIL_PASSWORD')
    MAIL_SERVER: str = os.getenv('MAIL_SERVER')
    MAIL_FROM: str = os.getenv('MAIL_FROM')
    MAIL_PORT: int = int(os.getenv('MAIL_PORT', 465))
    
    # Redis for Celery
    REDIS_URL: str = os.getenv('REDIS_URL', 'redis://localhost:6379/0')

    SENTRY_DSN: str = os.getenv('SENTRY_DSN')


    # CORS settings
    if os.getenv('MODE') == 'DEV':
        ALLOWED_ORIGINS = [
            'http://localhost:3000',
        ]
    else:
        # Production
        ALLOWED_ORIGINS = [
            'https://summar.me',
            'https://www.summar.me'
        ]


# Summary format configurations
SUMMARY_FORMATS = {
    # Basic formats (Free tier)
    'standard': {
        'name': 'Standard Text',
        'description': 'Connected prose, good for reading',
        'premium': False,
        'category': 'basic'
    },
    'bullets': {
        'name': 'Bullet Points',
        'description': 'Key points, convenient for notes',
        'premium': False,
        'category': 'basic'
    },
    'takeaways': {
        'name': 'Key Takeaways',
        'description': 'Main conclusions and insights',
        'premium': False,
        'category': 'basic'
    },
    
    # Advanced formats (Premium tier - but available for now)
    'executive': {
        'name': 'Executive Summary',
        'description': 'Problem → Solution → Results (business-oriented)',
        'premium': False,  # Set to False for now as requested
        'category': 'advanced'
    },
    'qa': {
        'name': 'Q&A Format',
        'description': 'Questions and answers for quick information lookup',
        'premium': False,
        'category': 'advanced'
    },
    'action_items': {
        'name': 'Action Items',
        'description': 'Specific steps and tasks with priorities',
        'premium': False,
        'category': 'advanced'
    },
    'pros_cons': {
        'name': 'Pros & Cons',
        'description': 'Detailed analysis of advantages and disadvantages',
        'premium': False,
        'category': 'advanced'
    },
    'timeline': {
        'name': 'Timeline',
        'description': 'Chronological presentation of events/processes',
        'premium': False,
        'category': 'advanced'
    },
    'study_guide': {
        'name': 'Study Guide',
        'description': 'Structured material for learning',
        'premium': False,
        'category': 'advanced'
    }
}

def get_available_formats(user_has_premium: bool = True) -> dict:
    '''Get formats available to user based on subscription status'''
    if user_has_premium:
        return SUMMARY_FORMATS
    else:
        return {k: v for k, v in SUMMARY_FORMATS.items() if not v['premium']}

def get_format_config(format_type: str) -> dict:
    '''Get configuration for a specific format'''
    return SUMMARY_FORMATS.get(format_type, SUMMARY_FORMATS['standard'])

# Create global settings instance
settings = Settings()