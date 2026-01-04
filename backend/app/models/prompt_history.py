from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Index, JSON, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class PromptHistory(Base):
    """
    История улучшения промптов.

    Одна запись = один вызов /api/v1/enhance.

    - id: UUID PK
    - user_id: FK → users.id (nullable, т.к. улучшения могут быть и без логина)
    - model_id: модель, на которую оптимизировали (из MODEL_REGISTRY)
    - provider: провайдер модели (gemini/openai/anthropic/...); дублируем из ModelMeta
    - input_prompt: исходный промпт пользователя
    - enhanced_prompt: улучшенный промпт, который вернули
    - params_json: JSON со всеми параметрами EnhancementParams (style, detail, и т.д.)
    - created_at: время создания записи
    """

    __tablename__ = "prompt_history"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False,
    )

    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    model_id: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    provider: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    input_prompt: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    enhanced_prompt: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    params_json: Mapped[dict] = mapped_column(
        JSON,
        nullable=False,
        default=dict,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
        server_default="now()",
        index=True,
    )

    # Пока односторонняя связь, чтобы не плодить лишнего кода
    user: Mapped["User"] = relationship(
        "User",
        backref="prompt_history",
        lazy="joined",
    )


# Индекс для частых выборок истории пользователя по дате
Index(
    "ix_prompt_history_user_created_at",
    PromptHistory.user_id,
    PromptHistory.created_at.desc(),
)
