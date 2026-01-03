# ---- Stage 1: build frontend ----
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Копируем только то, что нужно для установки зависимостей
COPY package.json package-lock.json* ./

RUN npm install

# Копируем исходники фронта
COPY vite.config.* tsconfig*.json ./
COPY src ./src
COPY public ./public

# Сборка SPA
RUN npm run build


# ---- Stage 2: backend + SPA ----
FROM python:3.11-slim AS backend

WORKDIR /app

# Устанавливаем системные зависимости (при необходимости)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Копируем backend и requirements
COPY backend/ ./backend/

RUN pip install --no-cache-dir -r backend/requirements.txt

# Копируем собранный фронт из первого stage
COPY --from=frontend-builder /app/dist ./dist

# Env-переменные по умолчанию (можно переопределить в docker-compose / на сервере)
ENV GEMINI_MODEL_NAME="gemini-2.5-flash" \
    FRONTEND_DIST_PATH="/app/dist"

# Экспонируем порт uvicorn
EXPOSE 8000

# Запускаем backend
CMD ["uvicorn", "app.main:app", "--app-dir", "backend", "--host", "0.0.0.0", "--port", "8000"]
