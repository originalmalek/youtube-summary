'''
Task management functions for background job processing.
'''

import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from motor.motor_asyncio import AsyncIOMotorClient
from utils.config import settings

def get_database():
    '''Get database connection'''
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    return client[settings.DATABASE_NAME]


async def create_task_record(
    user_id: str, 
    language: str = 'English',
    format_type: str = 'standard',
    task_type: str = 'file',
    file_info: Optional[Dict[str, Any]] = None,
    youtube_url: Optional[str] = None,
    email_data: Optional[Dict[str, Any]] = None,
    text_info: Optional[Dict[str, Any]] = None
) -> str:
    '''
    Create a new task record in MongoDB.
    
    Args:
        user_id: User ID who created the task
        language: Language for summary generation (default: English)
        format_type: Format type for summary generation (default: standard)
        task_type: Type of task ('file', 'youtube', 'email', or 'text')
        file_info: Information about the uploaded file (for file tasks)
        youtube_url: YouTube URL (for YouTube tasks)
        email_data: Email information (for email tasks)
        text_info: Information about the text input (for text tasks)
        
    Returns:
        Task ID
    '''
    task_id = str(uuid.uuid4())
    
    task_document = {
        '_id': task_id,
        'user_id': user_id,
        'status': 'pending',
        'created_at': datetime.now(timezone.utc),
        'updated_at': datetime.now(timezone.utc),
        'task_type': task_type,
        'language': language,
        'format_type': format_type,
        'current_step': 'queued',
        'progress': 0,
        'result': None,
        'error': None,
        'retry_count': 0,
        'max_retries': 3 if task_type == 'email' else 1
    }
    
    # Add task-specific data
    if task_type == 'file' and file_info:
        task_document['file_info'] = file_info
    elif task_type == 'youtube' and youtube_url:
        task_document['youtube_url'] = youtube_url
    elif task_type == 'email' and email_data:
        task_document['email_data'] = email_data
    elif task_type == 'text' and text_info:
        task_document['text_info'] = text_info
    
    db = get_database()
    await db['processing_tasks'].insert_one(task_document)
    return task_id


async def update_task_status(
    task_id: str, 
    status: str, 
    current_step: str = None, 
    progress: int = None,
    result: Dict[str, Any] = None,
    error: str = None,
    retry_count: int = None
) -> bool:
    '''
    Update task status in MongoDB.
    
    Args:
        task_id: Task ID to update
        status: New status (pending, processing, completed, failed)
        current_step: Current processing step description
        progress: Progress percentage (0-100)
        result: Task result data (when completed)
        error: Error message (when failed)
        retry_count: Number of retry attempts
        
    Returns:
        True if update was successful
    '''
    update_data = {
        'status': status,
        'updated_at': datetime.now(timezone.utc)
    }
    
    if current_step is not None:
        update_data['current_step'] = current_step
    if progress is not None:
        update_data['progress'] = progress
    if result is not None:
        update_data['result'] = result
    if error is not None:
        update_data['error'] = error
    if retry_count is not None:
        update_data['retry_count'] = retry_count
    
    db = get_database()
    result = await db['processing_tasks'].update_one(
        {'_id': task_id},
        {'$set': update_data}
    )
    
    return result.modified_count > 0


async def get_task_by_id(task_id: str) -> Optional[Dict[str, Any]]:
    '''
    Get task by ID from MongoDB.
    
    Args:
        task_id: Task ID to retrieve
        
    Returns:
        Task document or None if not found
    '''
    db = get_database()
    return await db['processing_tasks'].find_one({'_id': task_id})


async def get_user_tasks(user_id: str, limit: int = 50) -> list:
    '''
    Get tasks for a specific user.
    
    Args:
        user_id: User ID
        limit: Maximum number of tasks to return
        
    Returns:
        List of task documents
    '''
    db = get_database()
    cursor = db['processing_tasks'].find(
        {'user_id': user_id}
    ).sort('created_at', -1).limit(limit)
    
    return await cursor.to_list(length=limit)


async def cleanup_old_tasks(days_old: int = 7) -> int:
    '''
    Clean up old completed/failed tasks.
    
    Args:
        days_old: Delete tasks older than this many days
        
    Returns:
        Number of deleted tasks
    '''
    from datetime import timedelta
    
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=days_old)
    
    db = get_database()
    result = await db['processing_tasks'].delete_many({
        'created_at': {'$lt': cutoff_date},
        'status': {'$in': ['completed', 'failed']}
    })
    
    return result.deleted_count


async def get_task_stats() -> Dict[str, int]:
    '''
    Get task statistics.
    
    Returns:
        Dictionary with task counts by status
    '''
    pipeline = [
        {'$group': {'_id': '$status', 'count': {'$sum': 1}}},
        {'$sort': {'_id': 1}}
    ]
    
    db = get_database()
    cursor = db['processing_tasks'].aggregate(pipeline)
    stats = {}
    
    async for doc in cursor:
        stats[doc['_id']] = doc['count']
    
    return stats


async def increment_retry_count(task_id: str) -> bool:
    '''
    Increment retry count for a task.
    
    Args:
        task_id: Task ID to update
        
    Returns:
        True if update was successful
    '''
    db = get_database()
    result = await db['processing_tasks'].update_one(
        {'_id': task_id},
        {'$inc': {'retry_count': 1}, '$set': {'updated_at': datetime.now(timezone.utc)}}
    )
    
    return result.modified_count > 0


async def should_retry_task(task_id: str) -> bool:
    '''
    Check if a task should be retried based on retry count.
    
    Args:
        task_id: Task ID to check
        
    Returns:
        True if task should be retried
    '''
    task = await get_task_by_id(task_id)
    if not task:
        return False
    
    retry_count = task.get('retry_count', 0)
    max_retries = task.get('max_retries', 1)
    
    return retry_count < max_retries