from __future__ import annotations

import os
from typing import List, Optional

from fastapi import HTTPException, status
from google import genai

from app.core.config import get_settings
from app.schemas.enhancement import EnhanceRequest
from app.services.prompt_engine import build_meta_prompt, get_model_label

_client: Optional[genai.Client] = None


def _get_client() -> genai.Client:
    """
    Возвращает singleton-экземпляр genai.Client.

    Если ключ задан в настройках — передаём его явно, иначе SDK пробует взять его из окружения.
    """
    global _client

    if _client is not None:
        return _client

    settings = get_settings()

    if settings.gemini_api_key:
        _client = genai.Client(api_key=settings.gemini_api_key)
    else:
        _client = genai.Client()

    return _client


def _clean_gemini_output(raw_text: str, params: EnhanceRequest) -> str:
    """
    Очистка ответа модели от типичных преамбул (перенос логики из фронтового GeminiService).
    """
    enhanced_prompt_text = raw_text.strip()
    target_label = get_model_label(params.targetAiModel)

    common_preambles: List[str] = [
        f"enhanced prompt for {target_label}".lower(),
        "enhanced prompt:",
        "here is the enhanced prompt:",
        "here's your enhanced prompt:",
        "prompt:",
    ]

    final_prompt = enhanced_prompt_text
    for preamble in common_preambles:
        if final_prompt.lower().startswith(preamble):
            final_prompt = final_prompt[len(preamble) :].strip()
            break

    lines = enhanced_prompt_text.split("\n")
    if len(lines) > 1:
        first_line_lower = lines[0].lower()
        preamble_found = False
        for preamble in common_preambles:
            normalized = preamble.rstrip(":")
            if normalized in first_line_lower:
                preamble_found = True
                break

        if preamble_found:
            remaining = "\n".join(lines[1:]).strip()
            if remaining:
                final_prompt = remaining
            else:
                final_prompt = enhanced_prompt_text.strip()
        else:
            final_prompt = final_prompt.strip()

    return final_prompt.strip()


def enhance_prompt_with_gemini(params: EnhanceRequest) -> str:
    """
    Вызывает Gemini через Google Gen AI SDK и возвращает очищенный улучшенный промпт.
    """
    settings = get_settings()

    if not (
        settings.gemini_api_key
        or os.getenv("GEMINI_API_KEY")
        or os.getenv("GOOGLE_API_KEY")
    ):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gemini API key is not configured. Set GEMINI_API_KEY or GOOGLE_API_KEY.",
        )

    client = _get_client()
    meta_prompt = build_meta_prompt(params)

    try:
        response = client.models.generate_content(
            model=settings.gemini_model_name,
            contents=meta_prompt,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to call Gemini API: {exc}",
        ) from exc

    try:
        raw_text = response.text
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Unexpected Gemini response format: {exc}",
        ) from exc

    if not raw_text or not raw_text.strip():
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Gemini API returned empty response.",
        )

    return _clean_gemini_output(raw_text, params)
