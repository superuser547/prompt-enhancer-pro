from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_user
from app.core.security import create_access_token
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import Token, UserCreate, UserRead
from app.services.users import authenticate_user, create_user, get_user_by_email

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
