from dataclasses import dataclass
from typing import Dict, Optional


@dataclass(frozen=True)
class ModelMeta:
    """
    Метаданные AI-модели, аналогичные объектам в AI_MODELS на фронте.

    id       — внутренний идентификатор модели (value на фронте)
    label    — человеко-читаемое имя (label на фронте)
    provider — поставщик ('gemini', 'openai', 'anthropic', ...)

    is_image_model — флаг, что это модель для генерации изображений
                     (используется в prompt_engine для выбора формата вывода).
    """

    id: str
    label: str
    provider: str
    is_image_model: bool = False


# Основной реестр моделей: ключ — id (value на фронте), значение — ModelMeta.
# Значения синхронизированы с AI_MODELS из src/core/constants.ts.
MODEL_REGISTRY: Dict[str, ModelMeta] = {
    "chatgpt-4": ModelMeta(
        id="chatgpt-4",
        label="ChatGPT-4 / GPT-4o (Text)",
        provider="openai",
        is_image_model=False,
    ),
    "claude-3-opus": ModelMeta(
        id="claude-3-opus",
        label="Claude 3 Opus (Text)",
        provider="anthropic",
        is_image_model=False,
    ),
    "gemini-advanced": ModelMeta(
        id="gemini-advanced",
        label="Gemini Advanced (Text)",
        provider="gemini",
        is_image_model=False,
    ),
    "midjourney": ModelMeta(
        id="midjourney",
        label="Midjourney (Image)",
        provider="midjourney",
        is_image_model=True,
    ),
    "dall-e-3": ModelMeta(
        id="dall-e-3",
        label="DALL-E 3 (Image)",
        provider="openai",
        is_image_model=True,
    ),
    "stable-diffusion-xl": ModelMeta(
        id="stable-diffusion-xl",
        label="Stable Diffusion XL (Image)",
        provider="stability-ai",
        is_image_model=True,
    ),
    "imagen-3": ModelMeta(
        id="imagen-3",
        label="Imagen 3 (Image)",
        provider="google",
        is_image_model=True,
    ),
}


def get_model_meta(model_id: str) -> Optional[ModelMeta]:
    """
    Возвращает метаданные модели по её id (value из фронта).
    Если модель не найдена — возвращает None.
    """

    return MODEL_REGISTRY.get(model_id)
