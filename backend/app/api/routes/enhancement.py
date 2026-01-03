from fastapi import APIRouter

from app.schemas.enhancement import EnhanceRequest, EnhanceResponse

router = APIRouter(
    prefix="/api/v1",
    tags=["enhancement"],
)


@router.post(
    "/enhance",
    response_model=EnhanceResponse,
    summary="Enhance prompt",
    description=(
        "Принимает параметры исходного промпта и возвращает улучшенный промпт. "
        "Пока реализован как заглушка, которая просто возвращает исходный текст."
    ),
)
async def enhance_prompt(request: EnhanceRequest) -> EnhanceResponse:
    """
    Stub-реализация эндпоинта улучшения промпта.

    На этом этапе просто возвращает исходный промпт без изменений.
    Позже здесь будет вызов AI-провайдера (Gemini, OpenAI и т.д.).
    """
    # На будущее здесь будет логика:
    # - выбор модели/провайдера
    # - построение meta-prompt'а
    # - вызов AI API
    # - запись истории в БД и т.д.

    return EnhanceResponse(enhancedPrompt=request.initialPrompt)
