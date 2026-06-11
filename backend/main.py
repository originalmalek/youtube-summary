import sentry_sdk
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from routers.auth import router as auth_router
from routers.mail import router as mail_router
from routers.summary import router as summary_router
from routers.share import router as share_router
from routers.health import router as health_router
from routers.user import router as user_router
from utils.db import connect_to_mongo, close_mongo_connection
from utils.exceptions import register_exception_handlers
from utils.config import settings
from utils.rate_limit import limiter, rate_limit_exceeded_handler


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()

    yield
    # Shutdown
    await close_mongo_connection()

sentry_sdk.init(
    dsn=settings.SENTRY_DSN,
    # Add data like request headers and IP for users,
    # see https://docs.sentry.io/platforms/python/data-management/data-collected/ for more info
    send_default_pii=True,
)

app = FastAPI(
    title='YouTube Summary API',
    version='1.0.0',
    lifespan=lifespan
)

# Add rate limiter state
app.state.limiter = limiter

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix='/auth')
app.include_router(mail_router, prefix='/mail')
app.include_router(summary_router, prefix='/summary')
app.include_router(share_router)
app.include_router(health_router)
app.include_router(user_router, prefix='/user')

register_exception_handlers(app)

# Add rate limit exceeded handler
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

@app.get('/')
@limiter.limit("100/minute")
async def root(request: Request):
    return {'message': 'YouTube Summary API is running!', 'status': 'active'}



