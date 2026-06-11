'''
Celery configuration for background task processing.
'''

from celery import Celery
from utils.config import settings

# Create Celery instance
celery_app = Celery(
    'youtube_summary_tasks',
    broker=getattr(settings, 'REDIS_URL', 'redis://localhost:6379/0'),
    backend=getattr(settings, 'REDIS_URL', 'redis://localhost:6379/0'),
    include=['workers.document_processor']
)

# Celery configuration
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
)

# Task routing
celery_app.conf.task_routes = {
    'workers.document_processor.process_document_task': {'queue': 'document_processing'},
}

# Auto-discover tasks
celery_app.autodiscover_tasks(['workers'])