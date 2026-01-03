import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { EnhancementParams } from '../core/types';
import { AI_MODELS, GEMINI_MODEL_NAME } from '../core/constants';
import { buildMetaPrompt } from '../core/promptEngine';
import { ProviderClient } from '../core/providers';
import { TranslateFunction } from '../utils/i18n';

export class GeminiService implements ProviderClient {
  private static instance: GeminiService;
  private ai: GoogleGenAI;
  private t: TranslateFunction;

  private constructor(translateFunction: TranslateFunction) {
    this.t = translateFunction;
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY environment variable is not set.');
      // This error is critical and happens before t might be fully available,
      // so a hardcoded English message is acceptable here or a very basic t call.
      throw new Error(
        this.t('error.api.ensureKey', {
          message: 'GEMINI_API_KEY environment variable is not set',
        }),
      );
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  public static getInstance(translateFunction: TranslateFunction): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService(translateFunction);
    } else {
      // Update translator if a new one is provided (e.g. language change)
      GeminiService.instance.t = translateFunction;
    }
    return GeminiService.instance;
  }

  public async enhancePrompt(params: EnhancementParams, geminiModelName?: string): Promise<string> {
    const metaPrompt = buildMetaPrompt(params);
    const modelName = geminiModelName ?? GEMINI_MODEL_NAME;

    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: modelName,
        contents: metaPrompt,
      });

      const enhancedPromptText = response.text;

      if (!enhancedPromptText || enhancedPromptText.trim() === '') {
        throw new Error(this.t('error.api.emptyPrompt'));
      }

      const lines = enhancedPromptText.split('\n');
      // More robust cleanup: remove common preambles if Gemini adds them.
      const commonPreambles = [
        `enhanced prompt for ${AI_MODELS.find(m => m.value === params.targetAiModel)?.label || params.targetAiModel}`.toLowerCase(),
        'enhanced prompt:',
        'here is the enhanced prompt:',
        "here's your enhanced prompt:",
        'prompt:',
      ];

      let finalPrompt = enhancedPromptText.trim();
      for (const preamble of commonPreambles) {
        if (finalPrompt.toLowerCase().startsWith(preamble)) {
          finalPrompt = finalPrompt.substring(preamble.length).trim();
          break;
        }
      }
      // Check if the first line might still be a preamble after a split
      if (lines.length > 1) {
        const firstLineLower = lines[0].toLowerCase();
        let preambleFound = false;
        for (const preamble of commonPreambles) {
          if (firstLineLower.includes(preamble.replace(/:$/, ''))) {
            // remove trailing colon for looser match
            preambleFound = true;
            break;
          }
        }
        if (preambleFound && lines.slice(1).join('\n').trim().length > 0) {
          finalPrompt = lines.slice(1).join('\n').trim();
        } else {
          finalPrompt = enhancedPromptText.trim();
        }
      }

      return finalPrompt;
    } catch (error) {
      console.error('Gemini API call failed:', error);
      if (error instanceof Error) {
        if (error.message.toLowerCase().includes('api key not valid')) {
          throw new Error(this.t('error.api.invalidKey'));
        }
        throw new Error(this.t('error.api.geminiError', { message: error.message }));
      }
      throw new Error(this.t('error.api.unexpected'));
    }
  }
}
