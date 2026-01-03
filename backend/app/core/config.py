import os
from functools import lru_cache
from typing import List


class Settings:
    """Настройки backend-приложения."""

    gemini_api_key: str
    gemini_model_name: str
    cors_allow_origins: List[str]

    def __init__(self) -> None:
        # Новый SDK умеет автоматически подхватывать ключ из GEMINI_API_KEY или GOOGLE_API_KEY,
        # но мы читаем его явно, чтобы можно было однозначно пробросить.
        self.gemini_api_key = os.getenv("GEMINI_API_KEY", "")

        # Идентификатор модели для Gemini Developer API, без префикса models/.
        # В примерах используется строка вида "gemini-2.5-flash".
        self.gemini_model_name = os.getenv("GEMINI_MODEL_NAME", "gemini-2.5-flash")

        # Разрешённые CORS-источники для браузерных запросов к API.
        cors_origins_env = os.getenv("CORS_ALLOW_ORIGINS", "http://localhost:5173")
        self.cors_allow_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
