from __future__ import annotations

from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings

settings = get_settings()

# Создаём engine для PostgreSQL
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    future=True,
)

# Фабрика сессий
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=Session,
)


def get_db() -> Generator[Session, None, None]:
    """
    Dependency для FastAPI-эндпоинтов.

    Пример использования:

        def endpoint(db: Session = Depends(get_db)):
            ...

    Пока не используется, но функция нужна для будущих коммитов.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
