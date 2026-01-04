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
    database_url: str

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
            # Значение по умолчанию: dist/ в корне репозитория
            # backend/app/core → backend/app → backend → <root> → dist
            project_root = Path(__file__).resolve().parents[2].parent
            self.frontend_dist_path = (project_root / "dist").resolve()

        db_url = os.getenv("DATABASE_URL")
        if not db_url:
            # Жёсткая проверка: без DATABASE_URL backend не стартует,
            # чтобы мы не забыли настроить Postgres.
            raise RuntimeError(
                "DATABASE_URL is not set. Please configure PostgreSQL connection string."
            )
        self.database_url = db_url

        # Разрешённые CORS-источники для браузерных запросов к API.
        cors_origins_env = os.getenv("CORS_ALLOW_ORIGINS", "http://localhost:5173")
        self.cors_allow_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
