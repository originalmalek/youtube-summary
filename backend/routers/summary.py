import asyncio
from fastapi import APIRouter, HTTPException, Depends, Query, UploadFile, File, Request

from models.models import SummaryType, SummaryResponse, TextSummaryRequest
from utils.db import (
    create_summary_record,
    get_user_summaries,
    get_summary_by_id,
    update_summary_status
)
from utils.document_parser import get_file_info, extract_text_from_file
from utils.llm import generate_summary
from utils.security import authx_security
from utils.summary_youtube import get_transcript_text
from utils.tasks import create_task_record, get_task_by_id, update_task_status
from utils.config import get_available_formats
from workers.document_processor import process_document_task
from utils.rate_limit import limiter, RateLimits
from utils.usage_limits import check_user_summary_limit, increment_summary_usage


router = APIRouter()

@router.get('/summary_youtube')
@limiter.limit(RateLimits.YOUTUBE_SUMMARY)
async def summary_youtube(
    request: Request,
    youtube_url: str = Query(...),
    language: str = Query('English'),
    format_type: str = Query('standard'),
    user_data=Depends(authx_security.access_token_required)
):
    # Check if user can create a summary (check limits)
    await check_user_summary_limit(user_data.sub)

    # Create task record in database
    task_id = await create_task_record(
        user_id=user_data.sub,
        language=language,
        format_type=format_type,
        task_type='youtube',
        youtube_url=youtube_url
    )
    
    # Start background processing asynchronously
    
    async def process_youtube_async():
        try:
            # Update task to processing
            await update_task_status(
                task_id=task_id,
                status='processing',
                current_step='Extracting YouTube transcript...',
                progress=25
            )
            
            # Small delay to allow frontend to see progress
            await asyncio.sleep(1)
            
            # Extract transcript
            transcript_text = get_transcript_text(youtube_url)
            
            if not transcript_text:
                await update_task_status(
                    task_id=task_id,
                    status='failed',
                    current_step='No transcript found',
                    progress=0,
                    error='No transcript found for this video'
                )
                return
            
            # Update progress
            await update_task_status(
                task_id=task_id,
                status='processing',
                current_step='Generating summary...',
                progress=50
            )
            
            # Small delay to allow frontend to see progress
            await asyncio.sleep(1)
            
            # Generate summary
            summary = await generate_summary(transcript_text, language, format_type)
            
            if not summary:
                await update_task_status(
                    task_id=task_id,
                    status='failed',
                    current_step='Failed to generate summary',
                    progress=0,
                    error='Failed to generate summary'
                )
                return
            
            # Update progress
            await update_task_status(
                task_id=task_id,
                status='processing',
                current_step='Saving summary...',
                progress=75
            )
            
            # Small delay to allow frontend to see progress
            await asyncio.sleep(1)
            
            # Save summary to database
            summary_data = {
                'user_id': user_data.sub,
                'summary_type': SummaryType.youtube,
                'source_url': youtube_url,
                'source_content': transcript_text,
                'summary_text': summary,
                'language': language,
                'format_type': format_type
            }
            
            summary_id = await create_summary_record(summary_data)

            # Increment usage counter
            await increment_summary_usage(user_data.sub)

            # Update task as completed
            result = {
                'summary_id': summary_id,
                'summary_text': summary,
                'language': language,
                'youtube_url': youtube_url,
                'transcript_length': len(transcript_text),
                'summary_length': len(summary)
            }
            
            await update_task_status(
                task_id=task_id,
                status='completed',
                current_step='Summary generated successfully!',
                progress=100,
                result=result
            )
            
        except Exception as async_error:
            # Update task as failed
            await update_task_status(
                task_id=task_id,
                status='failed',
                current_step='Processing failed',
                progress=0,
                error=str(async_error)
            )
    
    # Start the async processing task (fire and forget)
    asyncio.create_task(process_youtube_async())
    
    # Return task information immediately
    return {
        'task_id': task_id,
        'status': 'queued',
        'message': 'Your YouTube video is being processed. Use the task_id to check status.',
        'youtube_url': youtube_url,
        'language': language,
        'format_type': format_type
    }


@router.post('/summary_file')
@limiter.limit(RateLimits.FILE_SUMMARY)
async def summary_file(
    request: Request,
    file: UploadFile = File(...),
    language: str = Query('English'),
    format_type: str = Query('standard'),
    user_data=Depends(authx_security.access_token_required)
):
    # Check if user can create a summary (check limits)
    await check_user_summary_limit(user_data.sub)

    # Validate file type
    supported_types = [
        'text/plain',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if file.content_type not in supported_types:
        raise HTTPException(
            status_code=400,
            detail=(
                f'Unsupported file type: {file.content_type}. '
                'Supported formats: TXT, PDF, DOC, DOCX.'
            )
        )

    # Validate file size (10MB max)
    max_size = 10 * 1024 * 1024  # 10MB
    if file.size > max_size:
        raise HTTPException(
            status_code=400,
            detail=(
                f'File too large. Maximum size is '
                f'{max_size // (1024*1024)}MB.'
            )
        )

    # Read file content
    file_content = await file.read()

    # Create file info
    file_info = get_file_info(file.filename, file.size, file.content_type)

    # Create task record in database
    task_id = await create_task_record(
        user_id=user_data.sub,
        language=language,
        format_type=format_type,
        task_type='file',
        file_info=file_info
    )
    
    # Start background processing asynchronously
    
    async def process_document_async():
        try:
            # Update task to processing
            await update_task_status(
                task_id=task_id,
                status='processing',
                current_step='Extracting text from document...',
                progress=25
            )
            
            # Small delay to allow frontend to see progress
            await asyncio.sleep(2)
            
            # Extract text
            text = extract_text_from_file(file_content, file.content_type)
            
            # Update progress
            await update_task_status(
                task_id=task_id,
                status='processing',
                current_step='Generating summary...',
                progress=50
            )
            
            # Small delay to allow frontend to see progress
            await asyncio.sleep(2)
            
            # Generate summary
            summary = await generate_summary(text, language, format_type)
            
            # Update progress
            await update_task_status(
                task_id=task_id,
                status='processing',
                current_step='Saving summary...',
                progress=75
            )
            
            # Small delay to allow frontend to see progress
            await asyncio.sleep(2)
            
            # Save summary to database
            summary_data = {
                'user_id': user_data.sub,
                'summary_type': SummaryType.file,
                'source_url': None,
                'source_content': text,
                'summary_text': summary,
                'language': language,
                'format_type': format_type
            }

            summary_id = await create_summary_record(summary_data)

            # Increment usage counter
            await increment_summary_usage(user_data.sub)

            # Update task as completed
            result = {
                'summary_id': summary_id,
                'summary_text': summary,
                'language': language,
                'file_info': file_info,
                'extracted_text_length': len(text),
                'summary_length': len(summary)
            }
            
            await update_task_status(
                task_id=task_id,
                status='completed',
                current_step='Summary generated successfully!',
                progress=100,
                result=result
            )
            
        except Exception as async_error:
            # Update task as failed
            await update_task_status(
                task_id=task_id,
                status='failed',
                current_step='Processing failed',
                progress=0,
                error=str(async_error)
            )
    
    # Start the async processing task (fire and forget)
    asyncio.create_task(process_document_async())
    
    # Return task information immediately
    return {
        'task_id': task_id,
        'status': 'queued',
        'message': 'Your document is being processed. Use the task_id to check status.',
        'file_info': file_info,
        'language': language,
        'format_type': format_type
    }


@router.post('/summary_text')
@limiter.limit(RateLimits.FILE_SUMMARY)
async def summary_text(
    request: Request,
    text_request: TextSummaryRequest,
    user_data=Depends(authx_security.access_token_required)
):
    '''Generate a summary from direct text input'''

    # Check if user can create a summary (check limits)
    await check_user_summary_limit(user_data.sub)

    # Validate text length
    text_length = len(text_request.text.strip())
    if text_length < 100:
        raise HTTPException(
            status_code=400,
            detail='Text is too short. Minimum length is 100 characters.'
        )

    if text_length > 50000:
        raise HTTPException(
            status_code=400,
            detail='Text is too long. Maximum length is 50,000 characters.'
        )

    # Create task record in database
    task_id = await create_task_record(
        user_id=user_data.sub,
        language=text_request.language,
        format_type=text_request.format_type,
        task_type='text',
        text_info={'text_length': text_length}
    )
    
    # Start background processing asynchronously
    
    async def process_text_async():
        try:
            # Update task to processing
            await update_task_status(
                task_id=task_id,
                status='processing',
                current_step='Processing text...',
                progress=25
            )
            
            # Small delay to allow frontend to see progress
            await asyncio.sleep(1)
            
            # Update progress
            await update_task_status(
                task_id=task_id,
                status='processing',
                current_step='Generating summary...',
                progress=50
            )
            
            # Generate summary
            summary = await generate_summary(text_request.text.strip(), text_request.language, text_request.format_type)
            
            if not summary:
                await update_task_status(
                    task_id=task_id,
                    status='failed',
                    current_step='Failed to generate summary',
                    progress=0,
                    error='Failed to generate summary'
                )
                return
            
            # Update progress
            await update_task_status(
                task_id=task_id,
                status='processing',
                current_step='Saving summary...',
                progress=75
            )
            
            # Small delay to allow frontend to see progress
            await asyncio.sleep(1)
            
            # Save summary to database
            summary_data = {
                'user_id': user_data.sub,
                'summary_type': SummaryType.text,
                'source_url': None,
                'source_content': text_request.text.strip(),
                'summary_text': summary,
                'language': text_request.language,
                'format_type': text_request.format_type
            }

            summary_id = await create_summary_record(summary_data)

            # Increment usage counter
            await increment_summary_usage(user_data.sub)

            # Update task as completed
            result = {
                'summary_id': summary_id,
                'summary_text': summary,
                'language': text_request.language,
                'text_info': {'text_length': text_length},
                'source_text_length': text_length,
                'summary_length': len(summary)
            }
            
            await update_task_status(
                task_id=task_id,
                status='completed',
                current_step='Summary generated successfully!',
                progress=100,
                result=result
            )
            
        except Exception as async_error:
            # Update task as failed
            await update_task_status(
                task_id=task_id,
                status='failed',
                current_step='Processing failed',
                progress=0,
                error=str(async_error)
            )
    
    # Start the async processing task (fire and forget)
    asyncio.create_task(process_text_async())
    
    # Return task information immediately
    return {
        'task_id': task_id,
        'status': 'queued',
        'message': 'Your text is being processed. Use the task_id to check status.',
        'text_info': {'text_length': text_length},
        'language': text_request.language,
        'format_type': text_request.format_type
    }


@router.get('/task/{task_id}/status')
@limiter.limit("120/hour")
async def get_task_status(
    request: Request,
    task_id: str,
    user_data=Depends(authx_security.access_token_required)
):
    '''Get the status of a background processing task.'''
    
    # Get task from database
    task = await get_task_by_id(task_id)
    
    if not task:
        raise HTTPException(status_code=404, detail='Task not found')
    
    # Verify the task belongs to the authenticated user
    if task.get('user_id') != user_data.sub:
        raise HTTPException(status_code=403, detail='Access denied')
    
    # Return task status
    return {
        'task_id': task_id,
        'status': task['status'],
        'current_step': task.get('current_step', ''),
        'progress': task.get('progress', 0),
        'created_at': task['created_at'],
        'updated_at': task['updated_at'],
        'file_info': task.get('file_info', {}),
        'email_data': task.get('email_data', {}),
        'text_info': task.get('text_info', {}),
        'language': task.get('language', 'English'),
        'format_type': task.get('format_type', 'standard'),
        'result': task.get('result'),
        'error': task.get('error'),
        'retry_count': task.get('retry_count', 0),
        'max_retries': task.get('max_retries', 1)
    }


@router.get('/summaries')
@limiter.limit(RateLimits.GET_SUMMARIES)
async def get_summaries(
    request: Request,
    limit: int = Query(10, le=100),
    offset: int = Query(0, ge=0),
    status: str = Query('active', regex='^(active|archived)$'),
    user_data=Depends(authx_security.access_token_required)
):
    '''Get user's summary history by status with pagination'''
    summaries = await get_user_summaries(user_data.sub, limit, status, offset)
    
    # Get total count for pagination
    from utils.db import get_user_summaries_count
    total = await get_user_summaries_count(user_data.sub, status)
    
    return {
        'summaries': summaries,
        'total': total,
        'limit': limit,
        'offset': offset,
        'has_next': offset + limit < total
    }


@router.get('/summary/{summary_id}')
@limiter.limit(RateLimits.GET_SUMMARY)
async def get_summary(
    request: Request,
    summary_id: str,
    user_data=Depends(authx_security.access_token_required)
):
    '''Get a specific summary by ID'''
    summary = await get_summary_by_id(summary_id)
    
    if not summary:
        raise HTTPException(status_code=404, detail='Summary not found')
    
    # Verify the summary belongs to the authenticated user
    if summary.get('user_id') != user_data.sub:
        raise HTTPException(status_code=403, detail='Access denied')
    
    return SummaryResponse(**summary)


@router.patch('/summary/{summary_id}/toggle-status')
@limiter.limit("50/hour")
async def toggle_summary_status(
    request: Request,
    summary_id: str,
    user_data=Depends(authx_security.access_token_required)
):
    '''Toggle summary status between active and archived'''
    # Get current summary
    summary = await get_summary_by_id(summary_id)
    
    if not summary:
        raise HTTPException(status_code=404, detail='Summary not found')
    
    # Verify the summary belongs to the authenticated user
    if summary.get('user_id') != user_data.sub:
        raise HTTPException(status_code=403, detail='Access denied')
    
    # Toggle status
    current_status = summary.get('status', 'active')
    new_status = 'archived' if current_status == 'active' else 'active'
    
    # Update in database
    success = await update_summary_status(summary_id, new_status)
    
    if not success:
        raise HTTPException(
            status_code=500,
            detail='Failed to update summary status'
        )
    
    # Return updated summary
    updated_summary = await get_summary_by_id(summary_id)
    return SummaryResponse(**updated_summary)


@router.delete('/summary/{summary_id}')
@limiter.limit("50/hour")
async def delete_summary(
    request: Request,
    summary_id: str,
    user_data=Depends(authx_security.access_token_required)
):
    '''Soft delete a summary by setting status to deleted'''
    # Get current summary (include deleted in case we're deleting
    # an already deleted item)
    summary = await get_summary_by_id(summary_id, include_deleted=True)
    
    if not summary:
        raise HTTPException(status_code=404, detail='Summary not found')
    
    # Verify the summary belongs to the authenticated user
    if summary.get('user_id') != user_data.sub:
        raise HTTPException(status_code=403, detail='Access denied')
    
    # Check if already deleted
    if summary.get('status') == 'deleted':
        raise HTTPException(
            status_code=400,
            detail='Summary is already deleted'
        )
    
    # Set status to deleted
    success = await update_summary_status(summary_id, 'deleted')
    
    if not success:
        raise HTTPException(
            status_code=500,
            detail='Failed to delete summary'
        )
    
    return {'message': 'Summary deleted successfully'}


@router.get('/formats')
@limiter.limit("100/hour")
async def get_summary_formats(request: Request, user_data=Depends(authx_security.access_token_required)):
    '''Get available summary formats for the authenticated user'''
    # For now, all formats are available (premium check can be added later)
    available_formats = get_available_formats(user_has_premium=True)
    
    return {
        'formats': available_formats,
        'default_format': 'standard'
    }