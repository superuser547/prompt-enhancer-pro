from __future__ import annotations

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Базовый класс для всех ORM-моделей."""
    pass


# ВАЖНО: эти импорты нужны, чтобы Alembic видел модели в Base.metadata
# и мог autogenerate миграции.
from app.models.user import User  # noqa: F401
from app.models.prompt_history import PromptHistory  # noqa: F401
