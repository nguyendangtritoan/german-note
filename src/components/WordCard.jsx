import React, { useState } from 'react';
import Button from './ui/Button';
import { Icon } from './ui/Icon';
import { useSettings } from '../context/SettingsContext';

export const WordCard = ({ wordData }) => {
  const { visibility } = useSettings();
  const { original, article, type, translations = {}, example, verbForms } = wordData;
  const [showVerbForms, setShowVerbForms] = useState(false);

  const renderArticle = () => {
    if (!article || article === 'null' || !visibility.article) return null;
    return <span className="font-bold text-indigo-600 transition-all duration-300">{article}</span>;
  };

  const isVerb = type?.toLowerCase().includes('verb');

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden transition-all hover:shadow-xl border border-slate-100 group">
      <div className="p-5">
        <header className="flex justify-between items-start mb-3">
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-slate-100 text-slate-500 border border-slate-200">{type || 'Word'}</span>
            </div>
            <h3 className="text-3xl font-bold text-slate-800">
              {renderArticle() && <>{renderArticle()} </>}{original}
            </h3>
          </div>
          {isVerb && verbForms && (
            <Button variant="secondary" size="sm" onClick={() => setShowVerbForms(!showVerbForms)} className="text-xs">
              <Icon name="Layers" className="w-4 h-4 mr-1" />{showVerbForms ? 'Hide Forms' : 'Forms'}
            </Button>
          )}
        </header>

        {isVerb && showVerbForms && verbForms && (
          <div className="mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100 text-sm animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div><span className="text-xs font-bold text-indigo-400 uppercase block">Present (3rd)</span><span className="text-slate-700 font-medium">{verbForms.present_3rd || '-'}</span></div>
              <div><span className="text-xs font-bold text-indigo-400 uppercase block">Präteritum</span><span className="text-slate-700 font-medium">{verbForms.past_3rd || '-'}</span></div>
              <div><span className="text-xs font-bold text-indigo-400 uppercase block">Perfekt</span><span className="text-slate-700 font-medium">{verbForms.perfect_3rd || '-'}</span></div>
              <div><span className="text-xs font-bold text-indigo-400 uppercase block">Konjunktiv II</span><span className="text-slate-700 font-medium">{verbForms.konjunktiv2_3rd || '-'}</span></div>
            </div>
          </div>
        )}

        <div className="space-y-3 mb-4">
          {translations && Object.entries(translations).map(([lang, text]) => (
            <div key={lang} className="flex items-center text-left">
              <span className="text-xs uppercase font-bold text-slate-400 w-8">{lang}</span>
              <span className="text-lg text-slate-700">{text}</span>
            </div>
          ))}
        </div>

        {example && (
          <div className="transition-all duration-300 text-left">
            <p className={`p-3 bg-slate-50 rounded-lg italic text-slate-600 ${visibility.example ? 'opacity-100' : 'opacity-0 h-0 p-0 m-0 overflow-hidden'}`}>
              {example}
            </p>
          </div>
        )}
      </div>
      
      <div className="bg-slate-50 p-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button className="text-xs text-slate-400 hover:text-red-500 flex items-center px-2 py-1 rounded hover:bg-red-50 transition-colors">
          <Icon name="Flag" className="w-3 h-3 mr-1" /> Wrong Context?
        </button>
      </div>
    </div>
  );
};

export const WordCardSkeleton = () => (
  <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-slate-100 animate-pulse">
    <div className="p-5">
      <div className="flex justify-between items-start mb-3">
        <div className="h-8 bg-slate-200 rounded w-1/2"></div>
      </div>
      <div className="space-y-3 mb-4">
        <div className="h-6 bg-slate-200 rounded w-1/3"></div>
      </div>
      <div className="h-12 bg-slate-100 rounded-lg"></div>
    </div>
  </div>
);