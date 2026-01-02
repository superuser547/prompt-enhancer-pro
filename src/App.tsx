import React, { useState, useCallback, useMemo } from 'react';
import { EnhancementParams } from './core/types';
import {
  AI_MODELS,
  GEMINI_MODEL_NAME,
  SUPPORTED_LANGUAGES,
  DEFAULT_UI_LANGUAGE,
  DEFAULT_PROMPT_LANGUAGE,
} from './core/constants';

import { Header } from './components/layout/Header';
import { PromptEnhancementForm } from './components/prompt-enhancer/PromptEnhancementForm';
import { EnhancedPromptDisplay } from './components/prompt-enhancer/EnhancedPromptDisplay';
import { LanguageSwitcher } from './components/prompt-enhancer/LanguageSwitcher';

import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { ErrorMessage } from './components/ui/ErrorMessage';

import { GeminiService } from './services/geminiService';
import { translate, TranslateFunction } from './utils/i18n';

const App: React.FC = () => {
  const [uiLanguage, setUiLanguage] = useState<string>(DEFAULT_UI_LANGUAGE);
  const [promptLanguage, setPromptLanguage] = useState<string>(DEFAULT_PROMPT_LANGUAGE);

  const t: TranslateFunction = useCallback(
    (key, replacements) => {
      return translate(uiLanguage, key, replacements);
    },
    [uiLanguage],
  );

  const [enhancementParams, setEnhancementParams] = useState<EnhancementParams>({
    initialPrompt: '',
    targetAiModel: AI_MODELS[0].value,
    styleOrTone: 'Default',
    detailLevel: 'Default',
    keywordsToAdd: '',
    negativePrompts: '',
    artisticMedium: 'Default',
    cameraAngle: 'Default',
    lighting: 'Default',
    colorPalette: 'Default',
    specificInstructions: '',
    promptLanguage: promptLanguage,
  });

  const [enhancedPrompt, setEnhancedPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const geminiService = useMemo(() => GeminiService.getInstance(t), [t]);

  const handleFormChange = useCallback((newParams: Partial<EnhancementParams>) => {
    setEnhancementParams(prev => ({ ...prev, ...newParams }));
  }, []);

  const handleUiLanguageChange = useCallback((langCode: string) => {
    setUiLanguage(langCode);
    // Update html lang attribute for accessibility
    document.documentElement.lang = langCode;
  }, []);

  const handlePromptLanguageChange = useCallback((langCode: string) => {
    setPromptLanguage(langCode);
    setEnhancementParams(prev => ({ ...prev, promptLanguage: langCode }));
  }, []);

  const selectedAiModelDetails = AI_MODELS.find(
    model => model.value === enhancementParams.targetAiModel,
  );

  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setEnhancedPrompt('');

    // Ensure promptLanguage is up-to-date in params for submission
    const currentParams = { ...enhancementParams, promptLanguage };

    try {
      const prompt = await geminiService.enhancePrompt(currentParams, GEMINI_MODEL_NAME);
      setEnhancedPrompt(prompt);
    } catch (err) {
      console.error('Error enhancing prompt:', err);
      if (err instanceof Error) {
        // The GeminiService error messages are already translated or generic
        setError(err.message);
      } else {
        setError(t('error.generic'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [enhancementParams, geminiService, promptLanguage, t]);

  // Update document title with current UI language
  React.useEffect(() => {
    document.title = t('app.title');
  }, [t]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <LanguageSwitcher
        uiLanguage={uiLanguage}
        promptLanguage={promptLanguage}
        supportedLanguages={SUPPORTED_LANGUAGES}
        onUiLanguageChange={handleUiLanguageChange}
        onPromptLanguageChange={handlePromptLanguageChange}
        t={t}
      />
      <Header t={t} />
      <main className="w-full max-w-5xl mt-8 space-y-8">
        <PromptEnhancementForm
          params={enhancementParams}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          selectedAiModel={selectedAiModelDetails}
          t={t}
        />
        {isLoading && <LoadingSpinner t={t} />}
        {error && <ErrorMessage message={error} t={t} />}
        {enhancedPrompt && !isLoading && <EnhancedPromptDisplay prompt={enhancedPrompt} t={t} />}
      </main>
      <footer className="w-full max-w-5xl mt-12 text-center text-sm text-slate-500">
        <p>{t('app.footer')}</p>
      </footer>
    </div>
  );
};

export default App;
