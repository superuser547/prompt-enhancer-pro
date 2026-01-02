
import React from 'react';
import { TranslateFunction } from '../utils/i18n';

interface ErrorMessageProps {
  message: string;
  t: TranslateFunction;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, t }) => {
  if (!message) return null;
  // The message itself is expected to be pre-translated or a direct error string.
  // The prefix "Error: " can be translated.
  return (
    <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-md relative my-4" role="alert">
      <strong className="font-bold">{t('error.prefix')}</strong>
      <span className="block sm:inline">{message}</span>
    </div>
  );
};
