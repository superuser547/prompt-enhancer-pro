
import React, { useState, useCallback } from 'react';
import { Button } from './Button';
import { TranslateFunction } from '../utils/i18n';

interface EnhancedPromptDisplayProps {
  prompt: string;
  t: TranslateFunction;
}

const ClipboardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
  </svg>
);

const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);


export const EnhancedPromptDisplay: React.FC<EnhancedPromptDisplayProps> = ({ prompt, t }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); 
    }).catch(err => {
      console.error('Failed to copy: ', err);
      // Optionally, use a toast notification for copy failure
    });
  }, [prompt]);

  return (
    <div className="mt-8 bg-slate-800 p-6 rounded-lg shadow-xl">
      <h2 className="text-2xl font-semibold text-green-400 mb-3">{t('enhancedPrompt.title')}</h2>
      <div className="bg-slate-900 p-4 rounded-md whitespace-pre-wrap text-slate-200 min-h-[100px] max-h-[400px] overflow-y-auto">
        {prompt}
      </div>
      <div className="mt-4 text-right">
        <Button onClick={handleCopy} variant="secondary" Icon={copied ? CheckIcon : ClipboardIcon}>
          {copied ? t('enhancedPrompt.button.copied') : t('enhancedPrompt.button.copy')}
        </Button>
      </div>
    </div>
  );
};
