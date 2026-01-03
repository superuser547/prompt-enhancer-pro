from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes.enhancement import router as enhancement_router
from app.core.config import get_settings

app = FastAPI(
    title="Prompt Enhancer Pro API",
    version="0.1.0",
    description=(
        "Backend API for Prompt Enhancer Pro. "
        "Provides a health-check endpoint and prompt enhancement via Gemini."
    ),
)

settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", summary="Health check", tags=["system"])
async def health_check() -> dict:
    """
    Простой health-check эндпоинт.

    Возвращает статус сервиса и, при необходимости, простую диагностическую информацию.
    """
    return {
        "status": "ok",
        "service": "prompt-enhancer-pro-backend",
    }


app.include_router(enhancement_router)

# Если dist существует, монтируем его как статические файлы после всех API-роутов,
# чтобы не перехватывать /api/* и системные эндпоинты.
if settings.frontend_dist_path.is_dir():
    app.mount(
        "/",
        StaticFiles(directory=str(settings.frontend_dist_path), html=True),
        name="frontend-static",
    )

    index_file: Path = settings.frontend_dist_path / "index.html"

    @app.get("/{full_path:path}", include_in_schema=False)
    async def spa_fallback(full_path: str, request: Request) -> FileResponse:
        """
        SPA fallback: для всех путей, которые не начинаются с /api или /health,
        отдаём index.html, если он существует.

        Это нужно, чтобы фронт на React/Vite мог сам разруливать маршрутизацию.
        """
        # Не перехватываем API и health-check
        if request.url.path.startswith("/api/") or request.url.path == "/health":
            # FastAPI сюда не должен попадать для существующих роутов,
            # но на всякий случай вернём 404.
            from fastapi import HTTPException

            raise HTTPException(status_code=404, detail="Not Found")

        if not index_file.is_file():
            from fastapi import HTTPException

            raise HTTPException(status_code=404, detail="Frontend is not built (index.html missing)")

        return FileResponse(index_file)
