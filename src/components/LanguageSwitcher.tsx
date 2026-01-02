
import React from 'react';
import { LanguageOption } from '../types';
import { SelectInput } from './SelectInput';
import { TranslateFunction } from '../utils/i18n';

interface LanguageSwitcherProps {
  uiLanguage: string;
  promptLanguage: string;
  supportedLanguages: LanguageOption[];
  onUiLanguageChange: (langCode: string) => void;
  onPromptLanguageChange: (langCode: string) => void;
  t: TranslateFunction;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  uiLanguage,
  promptLanguage,
  supportedLanguages,
  onUiLanguageChange,
  onPromptLanguageChange,
  t
}) => {
  const languageOptions = supportedLanguages.map(lang => ({ value: lang.code, label: lang.name }));

  return (
    <div className="w-full max-w-5xl mb-6 p-4 bg-slate-800 rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectInput
          id="uiLanguage"
          label={t('languageSwitcher.uiLanguage.label')}
          value={uiLanguage}
          onChange={onUiLanguageChange}
          options={languageOptions}
        />
        <SelectInput
          id="promptLanguage"
          label={t('languageSwitcher.promptLanguage.label')}
          value={promptLanguage}
          onChange={onPromptLanguageChange}
          options={languageOptions}
        />
      </div>
    </div>
  );
};
