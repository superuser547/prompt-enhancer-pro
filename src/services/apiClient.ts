import { EnhancementParams } from '../core/types';

/**
 * Тело запроса к backend'у на улучшение промпта.
 * Сейчас это 1-в-1 EnhancementParams.
 */
export type EnhanceRequestPayload = EnhancementParams;

/**
 * Ответ backend'а с улучшенным промптом.
 * Соответствует backend/app/schemas/enhancement.py::EnhanceResponse.
 */
export interface EnhanceResponsePayload {
  enhancedPrompt: string;
}

function getApiBaseUrl(): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;

  if (!baseUrl) {
    // На этой стадии просто кидаем понятную ошибку.
    // Позже можно будет сделать более мягкую деградацию (например, fallback к direct Gemini).
    throw new Error('VITE_API_BASE_URL is not configured');
  }

  // Можно дополнительно срезать хвостовой слэш, чтобы не было //api/v1/enhance.
  return baseUrl.replace(/\/+$/, '');
}

/**
 * Вызов backend-эндпоинта /api/v1/enhance.
 *
 * Отправляет EnhancementParams, получает { enhancedPrompt }.
 * Бросает Error при HTTP-ошибке или проблемах с JSON.
 */
export async function enhancePromptViaApi(
  payload: EnhanceRequestPayload,
): Promise<EnhanceResponsePayload> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/v1/enhance`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (networkError) {
    // Сеть/доступ до backend'а
    throw new Error(`Failed to reach backend API: ${String(networkError)}`);
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch (parseError) {
    // Не смогли распарсить JSON — это странно для нашего API
    throw new Error(
      `Failed to parse backend response as JSON (status ${response.status}): ${String(parseError)}`,
    );
  }

  if (!response.ok) {
    // Пытаемся вытащить осмысленную ошибку из тела
    const maybeError = data as { detail?: unknown };

    let message = `Backend API error (status ${response.status})`;

    if (maybeError && typeof maybeError.detail === 'string') {
      message += `: ${maybeError.detail}`;
    } else if (maybeError && Array.isArray(maybeError.detail)) {
      // FastAPI часто возвращает detail как список ошибок валидации
      const details = maybeError.detail
        .map((item: any) => (typeof item.msg === 'string' ? item.msg : JSON.stringify(item)))
        .join('; ');
      message += `: ${details}`;
    }

    throw new Error(message);
  }

  const typed = data as Partial<EnhanceResponsePayload>;

  if (typeof typed.enhancedPrompt !== 'string') {
    throw new Error('Backend response is missing "enhancedPrompt" field');
  }

  return {
    enhancedPrompt: typed.enhancedPrompt,
  };
}
