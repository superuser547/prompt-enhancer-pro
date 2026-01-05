from __future__ import annotations

import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import get_password_hash
from app.models.password_reset_token import PasswordResetToken
from app.models.user import User


def _generate_token() -> str:
    """
    Генерирует криптографически стойкий токен для сброса пароля.

    32 байта → 43 символа в base64-URL-safe.
    """
    return secrets.token_urlsafe(32)


def create_password_reset_token(db: Session, user: User) -> PasswordResetToken:
    """
    Создаёт новый токен сброса пароля для пользователя.

    Токен имеет срок действия, взятый из настроек (например, 60 минут).
    """
    settings = get_settings()
    # Можно завести отдельную переменную окружения, но пока используем auth_access_token_expire_minutes.
    expire_minutes = settings.auth_access_token_expire_minutes

    token_str = _generate_token()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=expire_minutes)

    reset_token = PasswordResetToken(
        user_id=user.id,
        token=token_str,
        expires_at=expires_at,
    )
    db.add(reset_token)
    db.commit()
    db.refresh(reset_token)
    return reset_token


def get_valid_reset_token(db: Session, token_str: str) -> Optional[PasswordResetToken]:
    """
    Возвращает действующий (не просроченный и не использованный) токен.

    Если токен не найден, просрочен или уже использован — возвращаем None.
    """
    now = datetime.now(timezone.utc)

    token = (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.token == token_str,
        )
        .first()
    )
    if token is None:
        return None

    if token.is_used or (token.expires_at <= now):
        return None

    return token


def mark_token_used(db: Session, token: PasswordResetToken) -> None:
    """
    Помечает токен как использованный.
    """
    now = datetime.now(timezone.utc)
    token.is_used = True
    token.used_at = now
    db.add(token)
    db.commit()


def reset_user_password(db: Session, user: User, new_password: str) -> None:
    """
    Сохраняет новый пароль пользователя (с хэшем).
    """
    user.password_hash = get_password_hash(new_password)
    db.add(user)
    db.commit()
