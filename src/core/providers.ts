import { EnhancementParams } from './types';

/**
 * Тип идентификатора провайдера.
 * Пока есть только 'gemini', позже будут добавлены 'openai', 'anthropic' и т.д.
 */
export type ProviderId = 'gemini';

/**
 * Базовый интерфейс клиента провайдера.
 * Все конкретные провайдеры (Gemini, OpenAI и т.д.) должны реализовывать этот контракт.
 */
export interface ProviderClient {
  enhancePrompt(params: EnhancementParams): Promise<string>;
}
