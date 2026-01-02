import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { EnhancementParams } from '../core/types';
import { AI_MODELS } from '../core/constants';
import { TranslateFunction } from '../utils/i18n';

export class GeminiService {
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

  private buildMetaPrompt(params: EnhancementParams): string {
    const targetModelDetails = AI_MODELS.find(m => m.value === params.targetAiModel);
    const targetModelName = targetModelDetails ? targetModelDetails.label : params.targetAiModel;
    const isImageModel = targetModelDetails?.isImageModel || false;
    const outputLanguageName = params.promptLanguage.toUpperCase(); // e.g., EN, RU, FR

    let metaPrompt = `You are a world-class prompt engineering assistant.
Your primary goal is to enhance the user's initial prompt to make it highly effective for the specified target AI model.
The final enhanced prompt MUST be in the target output language: **${outputLanguageName}**.

User's original prompt:
"${params.initialPrompt}"

Target AI Model: **${targetModelName}**.
Tailor the prompt structure, syntax, and keywords considering the specific strengths and requirements of this model. For example, Midjourney uses '--ar' for aspect ratio, DALL-E prefers descriptive sentences.

Target output language for the ENHANCED PROMPT: **${outputLanguageName}**.

Enhance this prompt by incorporating the following details and instructions.
If a parameter is "Default" or empty, use your best judgment or omit it if not applicable.
Remember to generate the final prompt in **${outputLanguageName}**.

**Core Enhancement Parameters:**
- **Style/Tone:** ${params.styleOrTone} (Interpret and apply this in ${outputLanguageName})
- **Detail Level:** ${params.detailLevel} (Adjust verbosity and detail in ${outputLanguageName})
- **Keywords/Concepts to Add/Emphasize:** ${params.keywordsToAdd || 'None specified'} (Incorporate these into the ${outputLanguageName} prompt)
- **Elements to Avoid/Negative Prompts:** ${params.negativePrompts || 'None specified'} (Ensure these are excluded in the ${outputLanguageName} prompt)
`;

    if (isImageModel) {
      metaPrompt += `
**Image Specific Parameters (for ${targetModelName}, in ${outputLanguageName}):**
- **Artistic Medium:** ${params.artisticMedium}
- **Camera Angle/Shot Type:** ${params.cameraAngle}
- **Lighting:** ${params.lighting}
- **Color Palette:** ${params.colorPalette}
`;
    }

    metaPrompt += `
**Specific Instructions for You (The Prompt Enhancer AI):**
${params.specificInstructions || `Generate the most effective and creative prompt in ${outputLanguageName} based on the above.`}

**Output Requirements:**
- Generate ONLY the enhanced prompt text, in **${outputLanguageName}**.
- Do NOT include any explanations, apologies, or conversational filler like "Here is the enhanced prompt:" before or after the prompt.
- The output should be ready to be copied and pasted directly into the target AI model (${targetModelName}).
- If the target model uses specific syntax (e.g., parameters like --v 6 or --ar 16:9 for Midjourney), try to incorporate them intelligently if relevant, ensuring they are compatible with the ${outputLanguageName} prompt.
- For image models, focus on vivid descriptions and artistic styles. For text models, focus on clarity, completeness, and appropriate tone. All in **${outputLanguageName}**.

Enhanced Prompt for ${targetModelName} (in ${outputLanguageName}):
`;
    return metaPrompt;
  }

  public async enhancePrompt(params: EnhancementParams, geminiModelName: string): Promise<string> {
    const metaPrompt = this.buildMetaPrompt(params);

    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: geminiModelName,
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
