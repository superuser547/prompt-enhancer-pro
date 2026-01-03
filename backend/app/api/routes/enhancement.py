from fastapi import APIRouter

from app.schemas.enhancement import EnhanceRequest, EnhanceResponse
from app.services.gemini_client import enhance_prompt_with_gemini

router = APIRouter(
    prefix="/api/v1",
    tags=["enhancement"],
)


@router.post(
    "/enhance",
    response_model=EnhanceResponse,
    summary="Enhance prompt",
    description=(
        "Принимает параметры исходного промпта и возвращает улучшенный промпт, "
        "полученный от Gemini через Google Gen AI SDK."
    ),
)
async def enhance_prompt(request: EnhanceRequest) -> EnhanceResponse:
    """
    Реализация эндпоинта улучшения промпта через Gemini.
    """
    enhanced = enhance_prompt_with_gemini(request)
    return EnhanceResponse(enhancedPrompt=enhanced)
