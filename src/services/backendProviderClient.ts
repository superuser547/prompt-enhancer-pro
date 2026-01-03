import { ProviderClient } from '../core/providers';
import { EnhancementParams } from '../core/types';
import { enhancePromptViaApi } from './apiClient';
import { TranslateFunction } from '../utils/i18n';

/**
 * ProviderClient, который работает не напрямую с Gemini,
 * а через backend REST API (/api/v1/enhance).
 *
 * Для App.tsx это по-прежнему "клиент провайдера",
 * но реализация теперь — HTTP-запрос вместо прямого SDK.
 */
export class BackendProviderClient implements ProviderClient {
  private readonly t: TranslateFunction;

  constructor(t: TranslateFunction) {
    this.t = t;
  }

  async enhancePrompt(params: EnhancementParams): Promise<string> {
    try {
      const response = await enhancePromptViaApi(params);
      return response.enhancedPrompt;
    } catch (error) {
      // error сюда прилетает в виде Error с message из apiClient.ts
      const message =
        error instanceof Error
          ? error.message
          : (this.t('error.api.unexpected') ?? 'Unexpected error while calling backend API');

      // Можно выбросить новый Error с уже "человеческим" текстом —
      // App.tsx уже умеет показывать error.message в UI.
      throw new Error(message);
    }
  }
}
