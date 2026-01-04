from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class User(Base):
    """
    Пользователь сервиса.

    - id: UUID PK
    - email: уникальный e-mail, по которому логинимся
    - password_hash: хэш пароля (bcrypt/argon2 и т.п. — позже)
    - is_active: флаг активности
    - created_at / updated_at: временные метки
    """

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(320),  # максимальная длина e-mail по стандарту
        unique=True,
        index=True,
        nullable=False,
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="true",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
        server_default="now()",
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
        server_default="now()",
        onupdate=datetime.utcnow,
    )

    def __repr__(self) -> str:  # pragma: no cover - метод для удобства отладки
        return f"<User id={self.id} email={self.email!r}>"
