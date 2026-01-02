export interface EnhancementParams {
  initialPrompt: string;
  targetAiModel: string;
  styleOrTone: string;
  detailLevel: string;
  keywordsToAdd: string;
  negativePrompts: string;
  artisticMedium: string; // For image AIs
  cameraAngle: string; // For image AIs
  lighting: string; // For image AIs
  colorPalette: string; // For image AIs
  specificInstructions: string;
  promptLanguage: string; // New: Language for the generated prompt
}

export interface AiModelOption {
  value: string;
  label: string;
  isImageModel?: boolean;
}

export interface LanguageOption {
  code: string;
  name: string;
}
