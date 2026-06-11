from fastapi import APIRouter, HTTPException, Depends, Path, Request
from nanoid import generate

from models.models import ShareResponse, SharedSummaryResponse
from utils.db import (
    get_summary_by_id,
    enable_summary_sharing,
    disable_summary_sharing,
    get_summary_by_share_id
)
from utils.security import authx_security
from utils.config import settings
from utils.rate_limit import limiter, RateLimits


router = APIRouter()


@router.post('/summary/share/{summary_id}', response_model=ShareResponse)
@limiter.limit(RateLimits.CREATE_SHARE)
async def create_share_link(
    request: Request,
    summary_id: str = Path(..., description="Summary ID to share"),
    user_data=Depends(authx_security.access_token_required)
):
    """Enable sharing for a summary and generate share link"""
    # Get the summary and verify ownership
    summary = await get_summary_by_id(summary_id)
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found")
    
    if summary['user_id'] != user_data.sub:
        raise HTTPException(status_code=403, detail="Not authorized to share this summary")
    
    # Check if already shared
    if summary.get('is_shared') and summary.get('share_id'):
        share_url = f"{settings.ROOT_URL}/share/{summary['share_id']}"
        return ShareResponse(
            share_url=share_url,
            share_id=summary['share_id']
        )
    
    # Generate unique share ID (URL-safe, 21 chars)
    share_id = generate(size=21)
    
    # Enable sharing
    success = await enable_summary_sharing(summary_id, share_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to enable sharing")
    
    # Return share URL
    share_url = f"{settings.ROOT_URL}/share/{share_id}"
    return ShareResponse(
        share_url=share_url,
        share_id=share_id
    )


@router.delete('/summary/share/{summary_id}')
@limiter.limit(RateLimits.CREATE_SHARE)
async def disable_share_link(
    request: Request,
    summary_id: str = Path(..., description="Summary ID to unshare"),
    user_data=Depends(authx_security.access_token_required)
):
    """Disable sharing for a summary"""
    # Get the summary and verify ownership
    summary = await get_summary_by_id(summary_id)
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found")
    
    if summary['user_id'] != user_data.sub:
        raise HTTPException(status_code=403, detail="Not authorized to manage this summary")
    
    # Disable sharing
    success = await disable_summary_sharing(summary_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to disable sharing")
    
    return {"message": "Sharing disabled successfully"}


@router.get('/share/{share_id}', response_model=SharedSummaryResponse)
@limiter.limit(RateLimits.GET_SHARE)
async def get_shared_summary(
    request: Request,
    share_id: str = Path(..., description="Share ID")
):
    """Get a shared summary by share ID (public endpoint - no auth required)"""
    summary = await get_summary_by_share_id(share_id)
    if not summary:
        raise HTTPException(status_code=404, detail="Shared summary not found")
    
    # Return only the necessary fields for public viewing
    return SharedSummaryResponse(
        summary_text=summary['summary_text'],
        summary_type=summary['summary_type'],
        format_type=summary.get('format_type', 'standard'),
        language=summary.get('language', 'English'),
        created_at=summary['created_at'],
        source_url=summary.get('source_url')
    )