
import React from 'react';
import { TranslateFunction } from '../../utils/i18n';

interface HeaderProps {
  t: TranslateFunction;
}

export const Header: React.FC<HeaderProps> = ({ t }) => {
  return (
    <header className="w-full max-w-5xl text-center">
      <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
        {t('header.title')}
      </h1>
      <p className="mt-2 text-lg text-slate-300">
        {t('header.subtitle')}
      </p>
    </header>
  );
};
