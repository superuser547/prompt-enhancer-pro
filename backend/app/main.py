from fastapi import FastAPI

from app.api.routes.enhancement import router as enhancement_router

app = FastAPI(
    title="Prompt Enhancer Pro API",
    version="0.1.0",
    description=(
        "Backend API for Prompt Enhancer Pro. "
        "Currently provides a basic health-check endpoint and a stub for prompt enhancement."
    ),
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
