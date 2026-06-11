from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
import time
import os

# Create limiter instance
# Disable rate limiting in test environment
limiter = Limiter(
    key_func=get_remote_address,
    enabled=os.getenv("TESTING", "false").lower() != "true"
)

# Custom error handler for rate limit exceeded
async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    response = JSONResponse(
        status_code=429,
        content={
            "detail": f"Rate limit exceeded: {exc.detail}",
            "error": "TOO_MANY_REQUESTS"
        }
    )
    # Add retry-after header
    retry_after = getattr(exc, 'retry_after', 60)
    response.headers["Retry-After"] = str(retry_after)
    response.headers["X-RateLimit-Limit"] = str(exc.limit.limit)
    response.headers["X-RateLimit-Remaining"] = "0"
    response.headers["X-RateLimit-Reset"] = str(int(time.time() + retry_after))
    
    return response

# Rate limit configurations for different endpoints
class RateLimits:
    # Authentication endpoints - stricter limits
    LOGIN = "10/hour"
    REGISTER = "5/hour" 
    PASSWORD_RESET = "3/hour"
    
    # Email endpoints
    EMAIL_VERIFY = "10/hour"
    RESEND_EMAIL = "10/hour"  # Increased from 3/hour for testing
    
    # Summary endpoints - more generous for authenticated users
    YOUTUBE_SUMMARY = "30/hour"
    FILE_SUMMARY = "20/hour"
    GET_SUMMARIES = "100/hour"
    GET_SUMMARY = "200/hour"
    
    # Share endpoints
    CREATE_SHARE = "50/hour"
    GET_SHARE = "200/hour"
    
    # General API
    DEFAULT = "60/hour"