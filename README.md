# Prompt Enhancer Pro

**Prompt Enhancer Pro** — инструмент для улучшения текстовых и визуальных промптов к различным моделям искусственного интеллекта. Приложение позволяет детально настроить будущий запрос и быстро получить готовый результат на выбранном языке.

## Возможности

- Выбор целевой ИИ‑модели (ChatGPT‑4, Claude 3 Opus, Midjourney, DALL‑E 3, Stable Diffusion XL, Imagen 3 и другие);
- Настройка стиля или тона текста, уровня детализации и ключевых понятий;
- Задание негативных промптов для исключения нежелательных элементов;
- Дополнительные параметры для генерации изображений: художественный стиль, угол камеры, освещение и цветовая палитра;
- Поддержка нескольких языков интерфейса и языка результирующего промпта;
- Просмотр полученного текста с возможностью скопировать его одним кликом.

## Запуск проекта

**Требования:** установленный Node.js.

1. Установите зависимости: `npm install`
2. Создайте файл `.env.local` и укажите в нём переменную `GEMINI_API_KEY` со значением вашего API‑ключа Gemini.
3. Запустите приложение командой `npm run dev`

После запуска откройте указанную в терминале ссылку в браузере и протестируйте работу Enhancer.

## Backend (FastAPI)

В репозитории есть простой backend на FastAPI (директория `backend/`), который позже будет использоваться для работы с AI-провайдерами, авторизацией, хранением истории и т.д.

Локальный запуск backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

После запуска backend будет доступен по адресу http://localhost:8000, health-check — по http://localhost:8000/health.

> Адаптируйте под привычный способ создания виртуального окружения (venv/poetry/uv), но базовую инструкцию лучше оставить.

### Настройки Gemini (Google Gen AI SDK)

Backend использует Google Gen AI SDK (`google-genai`) для работы с Gemini API.

Перед запуском убедитесь, что заданы переменные окружения:

- `GEMINI_API_KEY` — API-ключ Gemini (обязательный для Developer API)
- `GEMINI_MODEL_NAME` — идентификатор модели (по умолчанию `gemini-2.5-flash`)

Установка зависимостей backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Запуск backend:

```bash
export GEMINI_API_KEY="your_api_key_here"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Реестр поддерживаемых моделей

На backend есть реестр поддерживаемых моделей (`backend/app/models_meta.py`), который дублирует список моделей на фронте (`AI_MODELS` в `src/core/constants.ts`).

Endpoint `/api/v1/enhance`:

- вернёт HTTP 400, если указана модель, которой нет в реестре;
- вернёт HTTP 400, если модель относится к провайдеру, который пока не поддерживается backend'ом.
