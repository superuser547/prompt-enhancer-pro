import os
from functools import lru_cache


class Settings:
    """Настройки backend-приложения."""

    gemini_api_key: str
    gemini_model_name: str

    def __init__(self) -> None:
        # Новый SDK умеет автоматически подхватывать ключ из GEMINI_API_KEY или GOOGLE_API_KEY,
        # но мы читаем его явно, чтобы можно было однозначно пробросить.
        self.gemini_api_key = os.getenv("GEMINI_API_KEY", "")

        # Идентификатор модели для Gemini Developer API, без префикса models/.
        # В примерах используется строка вида "gemini-2.5-flash".
        self.gemini_model_name = os.getenv("GEMINI_MODEL_NAME", "gemini-2.5-flash")


@lru_cache
def get_settings() -> Settings:
    return Settings()
