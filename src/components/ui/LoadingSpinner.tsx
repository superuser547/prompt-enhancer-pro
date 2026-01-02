import React from 'react';
import { TranslateFunction } from '../../utils/i18n';

interface LoadingSpinnerProps {
  t: TranslateFunction;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ t }) => {
  return (
    <div className="flex justify-center items-center py-8" role="status" aria-live="polite">
      <div
        className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-500"
        aria-hidden="true"
      ></div>
      <p className="ml-4 text-lg text-slate-300">{t('loading.text')}</p>
    </div>
  );
};
