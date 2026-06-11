from fastapi import Request, FastAPI
from fastapi.responses import JSONResponse
from authx.exceptions import JWTDecodeError, AccessTokenRequiredError, MissingTokenError


async def jwt_decode_error_handler(request: Request, exc: JWTDecodeError):
    return JSONResponse(status_code=401, content={'message': str(exc)})

async def access_token_required_handler(request: Request, exc: AccessTokenRequiredError):
    return JSONResponse(status_code=409, content={'message': 'Access token is required.'})

async def missing_token_error_handler(request: Request, exc: MissingTokenError):
    return JSONResponse(status_code=401, content={'detail': 'Authentication required'})

def register_exception_handlers(app: FastAPI):
    app.add_exception_handler(JWTDecodeError, jwt_decode_error_handler)
    app.add_exception_handler(AccessTokenRequiredError, access_token_required_handler)
    app.add_exception_handler(MissingTokenError, missing_token_error_handler)