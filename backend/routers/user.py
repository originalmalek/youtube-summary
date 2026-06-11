from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from datetime import datetime, timezone
from bson import ObjectId
from bson.json_util import dumps as bson_dumps

from utils.security import authx_security
from utils.db import get_users_collection, get_summaries_collection
from utils.usage_limits import get_usage_stats

router = APIRouter(tags=["user"])


@router.get('/usage')
async def get_user_usage(user_data=Depends(authx_security.access_token_required)):
    """Get current usage statistics for the authenticated user"""
    try:
        usage_stats = await get_usage_stats(user_data.sub)
        return usage_stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Failed to get usage stats: {str(e)}')


@router.get('/export-data')
async def export_user_data(user_data=Depends(authx_security.access_token_required)):
    """Export all user data in GDPR-compliant JSON format"""
    try:
        # Query 1: Get user data
        user = await get_users_collection().find_one({'_id': ObjectId(user_data.sub)})
        if not user:
            raise HTTPException(status_code=404, detail='User not found')
        
        # Remove sensitive data
        user.pop('hashed_password', None)
        
        # Query 2: Get all user summaries
        summaries = await get_summaries_collection().find(
            {'user_id': user_data.sub}
        ).to_list(length=None)
        
        # Combine data
        export_data = {
            'export_info': {
                'exported_at': datetime.now(timezone.utc),
                'service': 'YouTube Summary'
            },
            'user': user,
            'summaries': summaries
        }
        
        # Convert to JSON with proper BSON handling
        json_content = bson_dumps(export_data, indent=2, ensure_ascii=False)
        
        return Response(
            content=json_content,
            media_type='application/json',
            headers={
                'Content-Disposition': f'attachment; filename="export-{datetime.now().strftime("%Y%m%d")}.json"'
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Export failed: {str(e)}')


@router.delete('/delete-account')
async def delete_account(user_data=Depends(authx_security.access_token_required)):
    """Delete user account and all associated data"""
    try:
        user_id = ObjectId(user_data.sub)
        
        # Delete all user summaries
        summaries_result = await get_summaries_collection().delete_many({'user_id': user_data.sub})
        
        # Delete user account
        user_result = await get_users_collection().delete_one({'_id': user_id})
        
        if user_result.deleted_count == 0:
            raise HTTPException(status_code=404, detail='User not found')
        
        return {
            'message': 'Account deleted successfully',
            'deleted_summaries': summaries_result.deleted_count
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Account deletion failed: {str(e)}')