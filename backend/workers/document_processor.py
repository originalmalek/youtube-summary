'''
Background worker for document processing tasks.
'''

import asyncio
from celery import Celery
from celery.utils.log import get_task_logger
from datetime import datetime

# Import our utilities
from utils.document_parser import extract_text_from_file, get_file_info
from utils.llm import generate_summary
from utils.tasks import update_task_status
from utils.db import create_summary_record
from models.models import SummaryType

# Create Celery app instance
from celery_app import celery_app

# Set up logging
logger = get_task_logger(__name__)


@celery_app.task(bind=True, name='process_document_task')
def process_document_task(self, task_id: str, file_content: bytes, content_type: str, 
                         filename: str, file_size: int, language: str, user_id: str):
    '''
    Process a document file in the background.
    
    Args:
        task_id: Unique task identifier
        file_content: File content as bytes
        content_type: MIME type of the file
        filename: Original filename
        file_size: File size in bytes
        language: Language for summary generation
        user_id: User ID who uploaded the file
    '''
    
    def run_async(coro):
        '''Helper to run async functions in sync context'''
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        return loop.run_until_complete(coro)
    
    try:
        logger.info(f'Starting document processing task {task_id}')
        
        # Update task status: processing
        run_async(update_task_status(
            task_id=task_id,
            status='processing',
            current_step='Extracting text from document...',
            progress=25
        ))
        
        # Extract text from document
        logger.info(f'Extracting text from {content_type} file')
        extracted_text = extract_text_from_file(file_content, content_type)
        
        logger.info(f'Extracted {len(extracted_text)} characters of text')
        
        # Update task status: generating summary
        run_async(update_task_status(
            task_id=task_id,
            status='processing',
            current_step='Generating AI summary...',
            progress=60
        ))
        
        # Generate summary using AI
        logger.info(f'Generating summary in {language}')
        summary_text = run_async(generate_summary(extracted_text, language))
        
        logger.info(f'Generated summary with {len(summary_text)} characters')
        
        # Update task status: saving to database
        run_async(update_task_status(
            task_id=task_id,
            status='processing',
            current_step='Saving summary to database...',
            progress=80
        ))
        
        # Save summary to database
        summary_data = {
            'user_id': user_id,
            'summary_type': SummaryType.file,
            'source_url': None,
            'source_content': extracted_text,
            'summary_text': summary_text,
            'language': language
        }
        
        summary_id = run_async(create_summary_record(summary_data))
        
        # Prepare result
        result = {
            'summary_id': summary_id,
            'summary_text': summary_text,
            'language': language,
            'file_info': get_file_info(filename, file_size, content_type),
            'extracted_text_length': len(extracted_text),
            'summary_length': len(summary_text)
        }
        
        # Update task status: completed
        run_async(update_task_status(
            task_id=task_id,
            status='completed',
            current_step='Summary generated successfully!',
            progress=100,
            result=result
        ))
        
        logger.info(f'Task {task_id} completed successfully')
        return result
        
    except Exception as e:
        logger.error(f'Task {task_id} failed: {str(e)}')
        
        # Update task status: failed
        run_async(update_task_status(
            task_id=task_id,
            status='failed',
            current_step='Processing failed',
            progress=0,
            error=str(e)
        ))
        
        # Re-raise the exception so Celery can handle it
        raise


@celery_app.task(bind=True, name='cleanup_old_tasks')
def cleanup_old_tasks(self, days_old: int = 7):
    '''
    Clean up old completed/failed tasks.
    
    Args:
        days_old: Delete tasks older than this many days
    '''
    
    def run_async(coro):
        '''Helper to run async functions in sync context'''
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        return loop.run_until_complete(coro)
    
    try:
        from utils.tasks import cleanup_old_tasks
        
        logger.info(f'Starting cleanup of tasks older than {days_old} days')
        
        deleted_count = run_async(cleanup_old_tasks(days_old))
        
        logger.info(f'Cleanup completed: {deleted_count} tasks deleted')
        return {'deleted_count': deleted_count}
        
    except Exception as e:
        logger.error(f'Cleanup task failed: {str(e)}')
        raise


# Optional: Add a periodic task to clean up old tasks
from celery.schedules import crontab

celery_app.conf.beat_schedule = {
    'cleanup-old-tasks': {
        'task': 'cleanup_old_tasks',
        'schedule': crontab(hour=2, minute=0),  # Run daily at 2 AM
        'args': (7,)  # Clean up tasks older than 7 days
    },
}