from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from datetime import datetime
import os
import httpx
from motor.motor_asyncio import AsyncIOMotorClient

from utils import db
from utils.config import settings

router = APIRouter(tags=["health"])


@router.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    """Basic health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "YouTube Summary API",
        "version": "1.0.0"
    }


@router.get("/health/detailed", status_code=status.HTTP_200_OK)
async def detailed_health_check():
    """Detailed health check with dependency status"""
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "YouTube Summary API",
        "version": "1.0.0",
        "checks": {
            "database": {"status": "unknown", "message": ""},
            "openai": {"status": "unknown", "message": ""},
            "smtp": {"status": "unknown", "message": ""}
        }
    }
    
    overall_healthy = True
    
    # Check MongoDB connection
    try:
        # Ping the database
        if db.client:
            await db.client.admin.command('ping')
            health_status["checks"]["database"] = {
                "status": "healthy",
                "message": "Connected to MongoDB",
                "database_name": settings.DATABASE_NAME
            }
        else:
            overall_healthy = False
            health_status["checks"]["database"] = {
                "status": "unhealthy",
                "message": "Database client not initialized"
            }
    except Exception as e:
        overall_healthy = False
        health_status["checks"]["database"] = {
            "status": "unhealthy",
            "message": f"Database connection failed: {str(e)}"
        }
    
    # Check OpenAI API
    try:
        if settings.OPENAI_API_KEY:
            # Simple check if API key exists and has correct format
            if settings.OPENAI_API_KEY.startswith("sk-"):
                health_status["checks"]["openai"] = {
                    "status": "healthy",
                    "message": "OpenAI API key configured"
                }
            else:
                overall_healthy = False
                health_status["checks"]["openai"] = {
                    "status": "unhealthy",
                    "message": "Invalid OpenAI API key format"
                }
        else:
            overall_healthy = False
            health_status["checks"]["openai"] = {
                "status": "unhealthy",
                "message": "OpenAI API key not configured"
            }
    except Exception as e:
        overall_healthy = False
        health_status["checks"]["openai"] = {
            "status": "unhealthy",
            "message": f"OpenAI check failed: {str(e)}"
        }
    
    # Check SMTP configuration
    try:
        smtp_configured = all([
            settings.MAIL_SERVER,
            settings.MAIL_USERNAME,
            settings.MAIL_FROM,
            settings.MAIL_PORT
        ])
        
        if smtp_configured:
            health_status["checks"]["smtp"] = {
                "status": "healthy",
                "message": "SMTP configuration present",
                "server": settings.MAIL_SERVER,
                "port": settings.MAIL_PORT
            }
        else:
            overall_healthy = False
            health_status["checks"]["smtp"] = {
                "status": "unhealthy",
                "message": "SMTP configuration incomplete"
            }
    except Exception as e:
        overall_healthy = False
        health_status["checks"]["smtp"] = {
            "status": "unhealthy",
            "message": f"SMTP check failed: {str(e)}"
        }
    
    # Set overall status
    health_status["status"] = "healthy" if overall_healthy else "degraded"
    
    # Return appropriate status code
    status_code = status.HTTP_200_OK if overall_healthy else status.HTTP_503_SERVICE_UNAVAILABLE
    
    return JSONResponse(
        status_code=status_code,
        content=health_status
    )


@router.get("/health/ready", status_code=status.HTTP_200_OK)
async def readiness_check():
    """Kubernetes readiness probe endpoint"""
    try:
        # Check if database is accessible
        if db.client:
            await db.client.admin.command('ping')
            return {"status": "ready", "timestamp": datetime.utcnow().isoformat()}
        else:
            raise Exception("Database client not initialized")
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "not ready",
                "timestamp": datetime.utcnow().isoformat(),
                "reason": "Database connection unavailable"
            }
        )


@router.get("/health/live", status_code=status.HTTP_200_OK)
async def liveness_check():
    """Kubernetes liveness probe endpoint"""
    return {
        "status": "alive",
        "timestamp": datetime.utcnow().isoformat()
    }