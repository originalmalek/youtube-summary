'''
Background worker for email processing tasks with auto-retry functionality.
'''

import asyncio
from utils.tasks import update_task_status, increment_retry_count, should_retry_task, get_task_by_id
from utils.mail import send_verification_email, send_password_reset_email


def is_temporary_error(error: Exception) -> bool:
    '''
    Determine if an error is temporary and should be retried.
    
    Args:
        error: Exception that occurred
        
    Returns:
        True if error is temporary and should be retried
    '''
    error_str = str(error).lower()
    
    # Temporary errors that should be retried
    temporary_indicators = [
        'timeout', 'connection', 'temporary', 'network', 'unavailable',
        'server not ready', 'try again', 'rate limit', 'throttled'
    ]
    
    # Permanent errors that should not be retried
    permanent_indicators = [
        'authentication failed', 'invalid credentials', 'permission denied',
        'invalid email', 'malformed', 'configuration error', 'not found'
    ]
    
    # Check for permanent errors first
    for indicator in permanent_indicators:
        if indicator in error_str:
            return False
    
    # Check for temporary errors
    for indicator in temporary_indicators:
        if indicator in error_str:
            return True
    
    # Default to temporary (retry) for unknown errors
    return True


async def process_email_task(task_id: str, email_data: dict):
    '''
    Process an email task in the background with auto-retry functionality.
    
    Args:
        task_id: Unique task identifier
        email_data: Dictionary containing email task information
            - email_type: Type of email ('verification', 'password_reset') 
            - email_address: Recipient email address
            - token: Email token for links
    '''
    
    # Validate required data
    email_type = email_data.get('email_type')
    email_address = email_data.get('email_address')
    token = email_data.get('token')
    
    if not email_type or not email_address or not token:
        await update_task_status(
            task_id=task_id,
            status='failed',
            current_step='Invalid email data',
            error='Missing required email data: email_type, email_address, or token'
        )
        return
    
    # Get task info for retry logic
    task = await get_task_by_id(task_id)
    if not task:
        return
    
    max_retries = task.get('max_retries', 3)
    retry_delays = [1, 3, 9]  # Exponential backoff delays in seconds
    
    for attempt in range(max_retries):
        try:
            # Update status for current attempt
            if attempt == 0:
                await update_task_status(
                    task_id=task_id,
                    status='processing',
                    current_step='Sending email...',
                    retry_count=attempt
                )
            else:
                await update_task_status(
                    task_id=task_id,
                    status='processing',
                    current_step=f'Retrying email send (attempt {attempt + 1}/{max_retries})',
                    retry_count=attempt
                )
            
            # Send appropriate email based on type
            if email_type == 'verification':
                await send_verification_email(email_address, token)
            elif email_type == 'password_reset':
                await send_password_reset_email(email_address, token)
            else:
                raise ValueError(f'Unknown email type: {email_type}')
            
            # Success! Update task as completed
            result = {
                'email_type': email_type,
                'email_address': email_address,
                'sent_at': asyncio.get_event_loop().time(),
                'status': 'sent',
                'attempts': attempt + 1
            }
            
            await update_task_status(
                task_id=task_id,
                status='completed',
                current_step='Email sent successfully!',
                result=result,
                retry_count=attempt
            )
            
            return result
            
        except Exception as e:
            # Log the error for this attempt
            error_msg = str(e)
            
            # Check if this is the last attempt or if error is permanent
            is_last_attempt = attempt == max_retries - 1
            is_permanent = not is_temporary_error(e)
            
            if is_last_attempt or is_permanent:
                # Final failure - update task as failed
                failure_reason = 'permanent error' if is_permanent else f'failed after {max_retries} attempts'
                await update_task_status(
                    task_id=task_id,
                    status='failed',
                    current_step=f'Email sending failed ({failure_reason})',
                    error=error_msg,
                    retry_count=attempt
                )
                return
            
            # Temporary error and not last attempt - prepare for retry
            await increment_retry_count(task_id)
            
            # Wait before retry with exponential backoff
            if attempt < len(retry_delays):
                delay = retry_delays[attempt]
            else:
                delay = retry_delays[-1]  # Use last delay for any additional attempts
            
            await asyncio.sleep(delay)
    
    # This should not be reached, but just in case
    await update_task_status(
        task_id=task_id,
        status='failed',
        current_step='Email sending failed (unexpected error)',
        error='Maximum retry attempts exceeded'
    )