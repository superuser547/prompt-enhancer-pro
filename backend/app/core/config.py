import os
from functools import lru_cache
from pathlib import Path
from typing import List


class Settings:
    """Настройки backend-приложения."""

    gemini_api_key: str
    gemini_model_name: str
    frontend_dist_path: Path
    cors_allow_origins: List[str]

    def __init__(self) -> None:
        # Новый SDK умеет автоматически подхватывать ключ из GEMINI_API_KEY или GOOGLE_API_KEY,
        # но мы читаем его явно, чтобы можно было однозначно пробросить.
        self.gemini_api_key = os.getenv("GEMINI_API_KEY", "")

        # Идентификатор модели для Gemini Developer API, без префикса models/.
        # В примерах используется строка вида "gemini-2.5-flash".
        self.gemini_model_name = os.getenv("GEMINI_MODEL_NAME", "gemini-2.5-flash")

        # Путь к собранному фронту (dist). Можно переопределить через переменную окружения.
        dist_env = os.getenv("FRONTEND_DIST_PATH")
        if dist_env:
            self.frontend_dist_path = Path(dist_env).resolve()
        else:
            # Значение по умолчанию: ../dist относительно каталога backend/
            # То есть корень репо → dist/
            self.frontend_dist_path = (Path(__file__).resolve().parents[2] / "dist").resolve()

        # Разрешённые CORS-источники для браузерных запросов к API.
        cors_origins_env = os.getenv("CORS_ALLOW_ORIGINS", "http://localhost:5173")
        self.cors_allow_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
