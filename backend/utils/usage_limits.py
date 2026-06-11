"""
Usage limits management for user summaries
Handles limit checking, usage tracking, and automatic resets based on subscription periods
"""

from datetime import datetime, timedelta
from typing import Dict, Optional
from bson import ObjectId
from fastapi import HTTPException

from utils.db import get_users_collection
from utils.subscription_plans import SUBSCRIPTION_PLANS


async def get_user_limits(user_type: str) -> int:
    """
    Get summary limit for a given user type

    Args:
        user_type: User's subscription plan (free, monthly_basic_eur, etc.)

    Returns:
        Number of summaries allowed per period
    """
    plan = SUBSCRIPTION_PLANS.get(user_type, SUBSCRIPTION_PLANS['free'])
    return plan['features']['summaries_per_month']


async def initialize_user_limits(user_id: str, user_type: str = 'free', created_at: Optional[datetime] = None) -> Dict:
    """
    Initialize usage limits for a new user or when upgrading subscription

    Args:
        user_id: User's MongoDB ObjectId as string
        user_type: Subscription plan type
        created_at: Account creation date (defaults to now)

    Returns:
        Updated user fields dict
    """
    if created_at is None:
        created_at = datetime.utcnow()

    limit = await get_user_limits(user_type)
    reset_date = created_at + timedelta(days=30)

    return {
        'summaries_used': 0,
        'summaries_limit': limit,
        'limit_reset_date': reset_date
    }


async def check_and_reset_if_needed(user_id: str) -> Dict:
    """
    Check if user's limit period has expired and reset if needed

    Args:
        user_id: User's MongoDB ObjectId as string

    Returns:
        Updated user document
    """
    user = await get_users_collection().find_one({'_id': ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if we need to reset (limit_reset_date has passed)
    now = datetime.utcnow()
    if user.get('limit_reset_date') and now >= user['limit_reset_date']:
        # Calculate new reset date (30 days from current reset date, not from now)
        new_reset_date = user['limit_reset_date'] + timedelta(days=30)

        # If we're way behind (multiple periods passed), catch up to current period
        while new_reset_date <= now:
            new_reset_date += timedelta(days=30)

        # Reset the counter
        await get_users_collection().update_one(
            {'_id': ObjectId(user_id)},
            {
                '$set': {
                    'summaries_used': 0,
                    'limit_reset_date': new_reset_date
                }
            }
        )

        # Return updated user
        user['summaries_used'] = 0
        user['limit_reset_date'] = new_reset_date

    return user


async def check_user_summary_limit(user_id: str) -> Dict:
    """
    Check if user can create a new summary
    Automatically resets counter if period has expired

    Args:
        user_id: User's MongoDB ObjectId as string

    Returns:
        Dict with usage stats: {used, limit, reset_date, can_create}

    Raises:
        HTTPException: 402 Payment Required if limit exceeded
    """
    # First, check and reset if needed
    user = await check_and_reset_if_needed(user_id)

    # Get current usage stats
    used = user.get('summaries_used', 0)
    limit = user.get('summaries_limit', 0)
    reset_date = user.get('limit_reset_date')

    # If user doesn't have limits set (old user), initialize them
    if limit == 0:
        user_type = user.get('user_type', 'free')
        limits = await initialize_user_limits(
            user_id,
            user_type,
            user.get('created_at', datetime.utcnow())
        )
        await get_users_collection().update_one(
            {'_id': ObjectId(user_id)},
            {'$set': limits}
        )
        used = limits['summaries_used']
        limit = limits['summaries_limit']
        reset_date = limits['limit_reset_date']

    # Check if limit exceeded
    if used >= limit:
        raise HTTPException(
            status_code=402,
            detail={
                'error': 'Monthly summary limit reached',
                'used': used,
                'limit': limit,
                'reset_date': reset_date.isoformat() if reset_date else None,
                'message': f'You have used all {limit} summaries for this period. Limit resets on {reset_date.strftime("%B %d, %Y") if reset_date else "unknown date"}. Upgrade your plan for more summaries.'
            }
        )

    return {
        'used': used,
        'limit': limit,
        'reset_date': reset_date,
        'can_create': True,
        'remaining': limit - used
    }


async def increment_summary_usage(user_id: str) -> Dict:
    """
    Increment user's summary usage counter after successful creation

    Args:
        user_id: User's MongoDB ObjectId as string

    Returns:
        Updated usage stats
    """
    result = await get_users_collection().update_one(
        {'_id': ObjectId(user_id)},
        {'$inc': {'summaries_used': 1}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=500, detail="Failed to update usage counter")

    # Get updated stats
    user = await get_users_collection().find_one({'_id': ObjectId(user_id)})
    return {
        'used': user.get('summaries_used', 0),
        'limit': user.get('summaries_limit', 0),
        'reset_date': user.get('limit_reset_date'),
        'remaining': user.get('summaries_limit', 0) - user.get('summaries_used', 0)
    }


async def reset_user_limits(user_id: str, user_type: str, subscription_start: Optional[datetime] = None) -> Dict:
    """
    Reset user limits when subscription is created/renewed
    Called from payment webhook

    Args:
        user_id: User's MongoDB ObjectId as string
        user_type: New subscription plan type
        subscription_start: Subscription start date (defaults to now)

    Returns:
        Updated usage stats
    """
    if subscription_start is None:
        subscription_start = datetime.utcnow()

    limit = await get_user_limits(user_type)
    reset_date = subscription_start + timedelta(days=30)

    await get_users_collection().update_one(
        {'_id': ObjectId(user_id)},
        {
            '$set': {
                'summaries_used': 0,
                'summaries_limit': limit,
                'limit_reset_date': reset_date,
                'user_type': user_type
            }
        }
    )

    return {
        'used': 0,
        'limit': limit,
        'reset_date': reset_date,
        'remaining': limit
    }


async def get_usage_stats(user_id: str) -> Dict:
    """
    Get current usage statistics for user
    Used by frontend to display usage info

    Args:
        user_id: User's MongoDB ObjectId as string

    Returns:
        Dict with usage stats: {used, limit, reset_date, remaining, percentage}
    """
    # Check and reset if needed
    user = await check_and_reset_if_needed(user_id)

    used = user.get('summaries_used', 0)
    limit = user.get('summaries_limit', 0)
    reset_date = user.get('limit_reset_date')

    # If limits not set, initialize them
    if limit == 0:
        user_type = user.get('user_type', 'free')
        limits = await initialize_user_limits(
            user_id,
            user_type,
            user.get('created_at', datetime.utcnow())
        )
        await get_users_collection().update_one(
            {'_id': ObjectId(user_id)},
            {'$set': limits}
        )
        used = limits['summaries_used']
        limit = limits['summaries_limit']
        reset_date = limits['limit_reset_date']

    remaining = max(0, limit - used)
    percentage = (used / limit * 100) if limit > 0 else 0

    return {
        'used': used,
        'limit': limit,
        'remaining': remaining,
        'reset_date': reset_date.isoformat() if reset_date else None,
        'percentage': round(percentage, 1),
        'user_type': user.get('user_type', 'free')
    }
