
import { AiModelOption, LanguageOption } from './types';

export const AI_MODELS: AiModelOption[] = [
  { value: 'chatgpt-4', label: 'ChatGPT-4 / GPT-4o (Text)' },
  { value: 'claude-3-opus', label: 'Claude 3 Opus (Text)' },
  { value: 'gemini-advanced', label: 'Gemini Advanced (Text)' },
  { value: 'midjourney', label: 'Midjourney (Image)', isImageModel: true },
  { value: 'dall-e-3', label: 'DALL-E 3 (Image)', isImageModel: true },
  { value: 'stable-diffusion-xl', label: 'Stable Diffusion XL (Image)', isImageModel: true },
  { value: 'imagen-3', label: 'Imagen 3 (Image)', isImageModel: true },
];

export const STYLES_TONES: string[] = [
  'Default', 'Formal', 'Informal', 'Humorous', 'Serious', 'Optimistic', 'Pessimistic', 
  'Poetic', 'Technical', 'Cinematic', 'Photorealistic', 'Artistic', 'Minimalist', 'Abstract'
];

export const DETAIL_LEVELS: string[] = [
  'Default', 'Concise', 'Standard', 'Detailed', 'Very Detailed (Verbose)'
];

export const ARTISTIC_MEDIUMS: string[] = [
  'Default', 'Oil Painting', 'Watercolor', 'Sketch', 'Pencil Drawing', 'Charcoal', 'Digital Painting', 
  '3D Render', 'Pixel Art', 'Vector Art', 'Anime/Manga', 'Comic Book Style', 'Claymation', 'Origami'
];

export const CAMERA_ANGLES: string[] = [
  'Default', 'Eye-Level Shot', 'Low Angle', 'High Angle', 'Dutch Angle', 'Bird\'s-Eye View', 
  'Worm\'s-Eye View', 'Close-Up', 'Extreme Close-Up', 'Medium Shot', 'Long Shot', 'Wide Shot', 'Over-the-Shoulder Shot'
];

export const LIGHTING_OPTIONS: string[] = [
  'Default', 'Natural Light', 'Studio Light', 'Soft Light', 'Hard Light', 'Rim Lighting', 'Backlighting', 
  'Volumetric Lighting', 'Cinematic Lighting', 'Dramatic Lighting', 'Neon Glow', 'Golden Hour', 'Blue Hour', 'Moonlight'
];

export const COLOR_PALETTES: string[] = [
  'Default', 'Vibrant', 'Muted', 'Pastel', 'Monochrome', 'Grayscale', 'Sepia', 
  'Warm Colors', 'Cool Colors', 'Analogous Colors', 'Complementary Colors', 'Triadic Colors', 'Neon'
];

export const GEMINI_MODEL_NAME = 'gemini-2.5-flash';

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Русский' },
  { code: 'fr', name: 'Français' },
  // Add more languages here as needed
  // { code: 'es', name: 'Español' },
  // { code: 'de', name: 'Deutsch' },
  // { code: 'ja', name: '日本語' },
  // { code: 'zh', name: '中文' },
];

export const DEFAULT_UI_LANGUAGE = 'en';
export const DEFAULT_PROMPT_LANGUAGE = 'en';
