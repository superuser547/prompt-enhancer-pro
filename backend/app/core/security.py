from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, password_hash: str) -> bool:
    """Проверяет, что plain_password соответствует хэшу."""
    return pwd_context.verify(plain_password, password_hash)


def get_password_hash(password: str) -> str:
    """Возвращает bcrypt-хэш указанного пароля."""
    return pwd_context.hash(password)


def create_access_token(
    subject: str,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    Создаёт JWT access-токен.

    subject — обычно user_id или e-mail (мы будем использовать строковый user_id).
    """
    settings = get_settings()
    if expires_delta is None:
        expires_delta = timedelta(minutes=settings.auth_access_token_expire_minutes)

    now = datetime.now(timezone.utc)
    expire = now + expires_delta

    to_encode: dict[str, Any] = {
        "sub": subject,
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }

    encoded_jwt = jwt.encode(
        to_encode,
        settings.auth_secret_key,
        algorithm="HS256",
    )
    return encoded_jwt


def decode_access_token(token: str) -> dict[str, Any]:
    """
    Декодирует access-токен и возвращает payload.

    Бросает JWTError при проблемах валидации/подписи/exp.
    """
    settings = get_settings()
    payload = jwt.decode(
        token,
        settings.auth_secret_key,
        algorithms=["HS256"],
    )
    return payload
