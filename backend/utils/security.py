from authx import AuthX
from passlib.context import CryptContext
from datetime import datetime, timezone, timedelta
from jose import jwt
from utils.config import settings

# Configure AuthX with JWT settings
authx_security = AuthX()
authx_security.config.JWT_SECRET_KEY = settings.JWT_SECRET_KEY

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_confirmation_token(username: str) -> str:
    secret = authx_security.config.JWT_SECRET_KEY
    exp = datetime.now(timezone.utc) + timedelta(minutes=30)
    payload = {
        'sub': username,
        'type': 'confirm',
        'exp': exp,
        'iat': datetime.now(timezone.utc)
    }
    return jwt.encode(payload, secret, algorithm='HS256')


def create_password_reset_token(username: str) -> str:
    secret = authx_security.config.JWT_SECRET_KEY
    exp = datetime.now(timezone.utc) + timedelta(minutes=30)
    payload = {
        'sub': username,
        'type': 'password_reset',
        'exp': exp,
        'iat': datetime.now(timezone.utc)
    }
    return jwt.encode(payload, secret, algorithm='HS256')