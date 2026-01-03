import { ProviderClient, ProviderId } from '../core/providers';
import { GeminiService } from './geminiService';
import { TranslateFunction } from '../utils/i18n';

/**
 * Фабрика клиентов провайдеров.
 * Сейчас поддерживается только 'gemini', но позже здесь будут добавлены другие провайдеры.
 */
export function getProviderClient(providerId: ProviderId, t: TranslateFunction): ProviderClient {
  switch (providerId) {
    case 'gemini':
    default:
      // Пока всегда возвращаем клиент Gemini
      return GeminiService.getInstance(t);
  }
}
