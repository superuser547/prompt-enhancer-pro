import { ProviderClient, ProviderId } from '../core/providers';
import { BackendProviderClient } from './backendProviderClient';
import { TranslateFunction } from '../utils/i18n';

/**
 * Фабрика клиентов провайдеров.
 * Сейчас поддерживается только 'gemini', но позже здесь будут добавлены другие провайдеры.
 */
export function getProviderClient(providerId: ProviderId, t: TranslateFunction): ProviderClient {
  switch (providerId) {
    case 'gemini':
    default:
      // Сейчас providerId по сути просто "тип логики",
      // а конкретный AI-провайдер спрятан за backend'ом.
      return new BackendProviderClient(t);
  }
}
