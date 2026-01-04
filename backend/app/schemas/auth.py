from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr = Field(..., description="E-mail пользователя")


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128)


class UserLogin(UserBase):
    password: str = Field(..., min_length=1)


class UserRead(UserBase):
    id: UUID
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True  # pydantic v2: позволяет строить из ORM-моделей


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: str
    exp: int
