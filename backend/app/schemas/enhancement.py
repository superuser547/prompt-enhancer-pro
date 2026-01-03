from pydantic import BaseModel


class EnhancementParams(BaseModel):
    """
    Pydantic-аналог фронтового интерфейса EnhancementParams (src/core/types.ts).

    Имена полей соответствуют JSON, который отправляет фронт.
    """

    initialPrompt: str
    targetAiModel: str
    styleOrTone: str
    detailLevel: str
    keywordsToAdd: str
    negativePrompts: str
    artisticMedium: str
    cameraAngle: str
    lighting: str
    colorPalette: str
    specificInstructions: str
    promptLanguage: str


class EnhanceRequest(EnhancementParams):
    """Тело запроса на улучшение промпта.

    На этом этапе повторяет EnhancementParams 1-в-1.
    """

    pass


class EnhanceResponse(BaseModel):
    """Ответ backend'а с улучшенным промптом."""

    enhancedPrompt: str
