from __future__ import annotations

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_user
from app.core.security import create_access_token
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import (
    PasswordResetConfirm,
    PasswordResetRequest,
    Token,
    UserCreate,
    UserRead,
)
from app.services.password_reset import (
    create_password_reset_token,
    get_valid_reset_token,
    mark_token_used,
    reset_user_password,
)
from app.services.users import authenticate_user, create_user, get_user_by_email

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["auth"],
)


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register_user(
    user_in: UserCreate,
    db: Annotated[Session, Depends(get_db)],
) -> UserRead:
    """
    Регистрация нового пользователя.

    - Если e-mail уже занят — HTTP 400.
    """
    email_normalized = user_in.email.lower()
    existing = get_user_by_email(db, email_normalized)
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )

    user = create_user(db, user_in)
    return UserRead.model_validate(user)


@router.post("/login", response_model=Token)
def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[Session, Depends(get_db)],
) -> Token:
    """
    Логин пользователя.

    Принимает данные формы:
    - username (e-mail)
    - password

    Возвращает access_token (JWT) типа "bearer".
    """
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(subject=str(user.id))

    return Token(access_token=access_token)


@router.get("/me", response_model=UserRead)
def read_current_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> UserRead:
    """
    Возвращает данные текущего аутентифицированного пользователя.
    """
    return UserRead.model_validate(current_user)


@router.post(
    "/request-password-reset",
    status_code=status.HTTP_200_OK,
)
def request_password_reset(
    payload: PasswordResetRequest,
    db: Annotated[Session, Depends(get_db)],
) -> dict:
    """
    Запрос на сброс пароля.

    Поведение:
    - Если пользователь с таким e-mail существует → создаём токен и "отправляем" (пока логируем).
    - Если не существует → возвращаем тот же ответ (не палим, есть ли такой пользователь).
    """
    email_normalized = payload.email.lower()
    user = get_user_by_email(db, email_normalized)

    if user:
        reset_token = create_password_reset_token(db, user)

        # Пока вместо отправки письма — логируем ссылку.
        # Позже сюда можно подвязать e-mail провайдера.
        logger.info(
            "Password reset requested for %s, token: %s",
            user.email,
            reset_token.token,
        )
        # Возможный формат "ссылки":
        # f"https://your-frontend-host/reset-password?token={reset_token.token}"

    # Всегда возвращаем один и тот же ответ
    return {
        "message": "If a user with this email exists, a password reset link has been sent."
    }


@router.post(
    "/reset-password",
    status_code=status.HTTP_200_OK,
)
def reset_password(
    payload: PasswordResetConfirm,
    db: Annotated[Session, Depends(get_db)],
) -> dict:
    """
    Сброс пароля по токену.

    - Проверяем токен (существует, не просрочен, не использован).
    - Меняем пароль пользователя.
    - Помечаем токен использованным.
    """
    token_str = payload.token
    new_password = payload.new_password

    token = get_valid_reset_token(db, token_str)
    if token is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token",
        )

    user = token.user
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User associated with this token is not available",
        )

    reset_user_password(db, user, new_password)
    mark_token_used(db, token)

    return {"message": "Password has been reset successfully."}
