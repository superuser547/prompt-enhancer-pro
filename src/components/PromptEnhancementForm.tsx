
import React from 'react';
import { EnhancementParams, AiModelOption } from '../types';
import { AI_MODELS, STYLES_TONES, DETAIL_LEVELS, ARTISTIC_MEDIUMS, CAMERA_ANGLES, LIGHTING_OPTIONS, COLOR_PALETTES } from '../constants';
import { TextAreaInput } from './TextAreaInput';
import { SelectInput } from './SelectInput';
import { TextInput } from './TextInput';
import { Button } from './Button';
import { TranslateFunction } from '../utils/i18n';

interface PromptEnhancementFormProps {
  params: EnhancementParams;
  onChange: (newParams: Partial<EnhancementParams>) => void;
  onSubmit: () => void;
  isLoading: boolean;
  selectedAiModel?: AiModelOption;
  t: TranslateFunction;
  uiLanguage: string; // To help re-map default options if needed
}

const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12L17 14.188V12.001L18.25 12z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 12a3.75 3.75 0 00-7.5 0M12.75 19.5a3.75 3.75 0 007.5 0M12.75 4.5a3.75 3.75 0 007.5 0M17.25 12a.75.75 0 010 1.5h-.008a.75.75 0 010-1.5H17.25z" />
 </svg>
);


export const PromptEnhancementForm: React.FC<PromptEnhancementFormProps> = ({
  params,
  onChange,
  onSubmit,
  isLoading,
  selectedAiModel,
  t,
  uiLanguage
}) => {
  const handleInputChange = <K extends keyof EnhancementParams,>(
    key: K,
    value: EnhancementParams[K]
  ) => {
    onChange({ [key]: value });
  };

  const isImageModel = selectedAiModel?.isImageModel || false;

  // Helper to translate "Default" options for select inputs
  const translateSelectOptions = (optionsArray: string[]) => {
    return optionsArray.map(opt => ({
      value: opt,
      label: opt === 'Default' ? t('param.default') : opt,
    }));
  };


  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-6 bg-slate-800 p-6 sm:p-8 rounded-lg shadow-xl"
    >
      <div>
        <h2 className="text-2xl font-semibold text-indigo-400 mb-1">{t('form.section1.title')}</h2>
        <p className="text-sm text-slate-400 mb-4">{t('form.section1.description')}</p>
        <TextAreaInput
          id="initialPrompt"
          label={t('form.initialPrompt.label')}
          value={params.initialPrompt}
          onChange={(val) => handleInputChange('initialPrompt', val)}
          placeholder={t('form.initialPrompt.placeholder')}
          rows={3}
          required
          disabled={isLoading}
        />
      </div>

      <SelectInput
        id="targetAiModel"
        label={t('form.targetAiModel.label')}
        value={params.targetAiModel}
        onChange={(val) => handleInputChange('targetAiModel', val)}
        options={AI_MODELS.map(m => ({value: m.value, label: m.label}))} // Assuming model labels are mostly universal or brand names
        required
        disabled={isLoading}
      />

      <div>
        <h2 className="text-2xl font-semibold text-indigo-400 mt-8 mb-1">{t('form.section2.title')}</h2>
        <p className="text-sm text-slate-400 mb-4">{t('form.section2.description')}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectInput
              id="styleOrTone"
              label={t('form.styleOrTone.label')}
              value={params.styleOrTone}
              onChange={(val) => handleInputChange('styleOrTone', val)}
              options={translateSelectOptions(STYLES_TONES)}
              disabled={isLoading}
            />
            <SelectInput
              id="detailLevel"
              label={t('form.detailLevel.label')}
              value={params.detailLevel}
              onChange={(val) => handleInputChange('detailLevel', val)}
              options={translateSelectOptions(DETAIL_LEVELS)}
              disabled={isLoading}
            />
        </div>
        <div className="mt-6">
            <TextInput
              id="keywordsToAdd"
              label={t('form.keywordsToAdd.label')}
              value={params.keywordsToAdd}
              onChange={(val) => handleInputChange('keywordsToAdd', val)}
              placeholder={t('form.keywordsToAdd.placeholder')}
              disabled={isLoading}
            />
        </div>
        <div className="mt-6">
            <TextInput
              id="negativePrompts"
              label={t('form.negativePrompts.label')}
              value={params.negativePrompts}
              onChange={(val) => handleInputChange('negativePrompts', val)}
              placeholder={t('form.negativePrompts.placeholder')}
              disabled={isLoading}
            />
        </div>
      </div>
      
      {isImageModel && (
        <div>
          <h2 className="text-2xl font-semibold text-indigo-400 mt-8 mb-1">{t('form.section3.title', {modelName: selectedAiModel?.label || 'Image AI'})}</h2>
          <p className="text-sm text-slate-400 mb-4">{t('form.section3.description')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectInput
              id="artisticMedium"
              label={t('form.artisticMedium.label')}
              value={params.artisticMedium}
              onChange={(val) => handleInputChange('artisticMedium', val)}
              options={translateSelectOptions(ARTISTIC_MEDIUMS)}
              disabled={isLoading}
            />
            <SelectInput
              id="cameraAngle"
              label={t('form.cameraAngle.label')}
              value={params.cameraAngle}
              onChange={(val) => handleInputChange('cameraAngle', val)}
              options={translateSelectOptions(CAMERA_ANGLES)}
              disabled={isLoading}
            />
            <SelectInput
              id="lighting"
              label={t('form.lighting.label')}
              value={params.lighting}
              onChange={(val) => handleInputChange('lighting', val)}
              options={translateSelectOptions(LIGHTING_OPTIONS)}
              disabled={isLoading}
            />
            <SelectInput
              id="colorPalette"
              label={t('form.colorPalette.label')}
              value={params.colorPalette}
              onChange={(val) => handleInputChange('colorPalette', val)}
              options={translateSelectOptions(COLOR_PALETTES)}
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-semibold text-indigo-400 mt-8 mb-1">{t('form.section4.title')}</h2>
         <p className="text-sm text-slate-400 mb-4">{t('form.section4.description')}</p>
        <TextAreaInput
          id="specificInstructions"
          label={t('form.specificInstructions.label')}
          value={params.specificInstructions}
          onChange={(val) => handleInputChange('specificInstructions', val)}
          placeholder={t('form.specificInstructions.placeholder')}
          rows={3}
          disabled={isLoading}
        />
      </div>

      <div className="pt-5">
        <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading || !params.initialPrompt} className="w-full sm:w-auto" Icon={SparklesIcon}>
          {isLoading ? t('form.button.enhancing') : t('form.button.enhance')}
        </Button>
      </div>
    </form>
  );
};
