import { EnhancementParams } from './types';
import { AI_MODELS } from './constants';

export function buildMetaPrompt(params: EnhancementParams): string {
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
