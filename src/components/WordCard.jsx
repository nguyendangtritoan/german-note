import React, { useState } from 'react';
import { Icon } from './ui/Icon';
import { useSettings } from '../context/SettingsContext';

const renderHighlightedText = (text) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <span key={index} className="text-indigo-700 dark:text-indigo-300 font-bold bg-indigo-50/80 dark:bg-indigo-900/50 px-1 rounded-mdMX mx-0.5 border border-indigo-100 dark:border-indigo-800 shadow-sm">
          {part.slice(2, -2)}
        </span>
      );
    }
    return <span key={index} className="text-slate-600 dark:text-slate-300">{part}</span>;
  });
};

export const WordCard = ({ wordData, onDelete, onRegenerate }) => {
  const { visibility } = useSettings();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { original, article, type, translations = {}, example, grammarTopic, Tk, plural, verbForms } = wordData;

  const renderArticle = () => {
    if (!article || article === 'null' || !visibility.article) return null;
    return <span className="text-indigo-500 dark:text-indigo-400 mr-2">{article}</span>;
  };

  const handleRegenerateClick = async (e) => {
    e.stopPropagation();
    if (isRegenerating || !onRegenerate) return;
    setIsRegenerating(true);
    await onRegenerate();
    setIsRegenerating(false);
  };

  const formatForms = (text) => {
    if (!text) return null;
    if (Array.isArray(text)) return text.join(' \u00B7 ');
    return String(text).replace(/,/g, ' \u00B7');
  };
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-md border border-slate-100 dark:border-slate-700 transition-all duration-300 group overflow-hidden relative">

      {/* Header Badges */}
      <div className="px-5 pt-5 pb-1 flex justify-between items-start">
        <div className="flex gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600">
            {type || 'Word'}
          </span>
          {grammarTopic && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
              <Icon name="Sparkles" className="w-3 h-3 mr-1" />
              {grammarTopic}
            </span>
          )}
        </div>
        {onDelete && (
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100" title="Remove">
            <Icon name="X" className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="px-5 pb-4">
        <div className="mb-3">
          <div className="flex flex-wrap items-center gap-x-6">
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              {renderArticle()}{original}
            </h3>
            {visibility.verbForms && verbForms && verbForms !== 'null' && (
              <span className="text-2xl font-medium text-slate-300 dark:text-slate-600 tracking-tight blur-[0.5px] hover:blur-0 transition-all duration-300">
                {formatForms(verbForms)}
              </span>
            )}
            {visibility.plural && plural && plural !== 'null' && (
              <span className="text-2xl font-medium text-slate-300 dark:text-slate-600 tracking-tight blur-[0.5px] hover:blur-0 transition-all duration-300">
                {plural}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2 mt-4">
          {translations && Object.entries(translations).map(([lang, text]) => (
            <div key={lang} className="flex items-center gap-3 group/trans">
              <span className="text-[10px] font-bold text-slate-400 w-6 text-right uppercase tracking-wider">{lang}</span>
              <span className="text-lg text-slate-700 dark:text-slate-300 font-medium border-b border-transparent group-hover/trans:border-slate-100 dark:group-hover/trans:border-slate-700 transition-colors">
                {text.split('|').map((part, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <span className="text-slate-300 dark:text-slate-600 mx-2 text-base align-middle">|</span>}
                    {part.trim()}
                  </React.Fragment>
                ))}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Example */}
      {example && (
        <div className={`relative bg-gradient-to-r from-indigo-50/40 to-slate-50/40 dark:from-slate-700/40 dark:to-slate-800/40 border-t border-slate-100/50 dark:border-slate-700/50 transition-all duration-300 ${visibility.example ? 'opacity-100' : 'hidden'}`}>
          <div className="px-5 py-3 flex gap-3 items-start">
            <div className="mt-1 shrink-0 opacity-30">
              <Icon name="BookOpen" className="w-4 h-4 text-indigo-900 dark:text-indigo-300" />
            </div>
            <p className="flex-1 text-base leading-relaxed italic text-slate-600 dark:text-slate-300">
              {renderHighlightedText(example)}
            </p>
            {onRegenerate && (
              <button onClick={handleRegenerateClick} disabled={isRegenerating} className={`shrink-0 p-1.5 rounded-lg border transition-all duration-200 mt-0.5 ${isRegenerating ? 'bg-white dark:bg-slate-700 border-indigo-100 dark:border-indigo-900 text-indigo-400 cursor-wait' : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:border-indigo-200 hover:shadow-sm'}`} title="Regenerate sentence">
                <Icon name={isRegenerating ? "Loader2" : "RefreshCw"} className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const WordCardSkeleton = () => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 animate-pulse">
    <div className="flex gap-2 mb-4">
      <div className="h-5 w-16 bg-slate-100 dark:bg-slate-700 rounded-lg"></div>
      <div className="h-5 w-24 bg-slate-100 dark:bg-slate-700 rounded-lg"></div>
    </div>
    <div className="h-10 w-48 bg-slate-200 dark:bg-slate-600 rounded-lg mb-2"></div>
    <div className="space-y-3 mt-6">
      <div className="h-6 w-full max-w-[200px] bg-slate-100 dark:bg-slate-700 rounded"></div>
      <div className="h-6 w-full max-w-[180px] bg-slate-100 dark:bg-slate-700 rounded"></div>
    </div>
    <div className="mt-6 h-16 bg-slate-50 dark:bg-slate-700 rounded-xl w-full"></div>
  </div>
);