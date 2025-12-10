import React, { useState } from 'react';
import Button from './ui/Button';
import { Icon } from './ui/Icon';
import { useSettings } from '../context/SettingsContext';

const renderHighlightedText = (text) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="text-indigo-700 font-bold bg-indigo-50 px-1 rounded">{part.slice(2, -2)}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
};

export const WordCard = ({ wordData, onDelete }) => {
  const { visibility } = useSettings();
  const { original, article, type, translations = {}, example, grammarTopic } = wordData;

  const renderArticle = () => {
    if (!article || article === 'null' || !visibility.article) return null;
    return <span className="font-bold text-indigo-600 transition-all duration-300">{article}</span>;
  };

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden transition-all hover:shadow-xl border border-slate-100 group relative">
      <div className="p-5">
        
        {/* TOP CONTROLS (Badge + Delete) */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          
          {/* Grammar Badge */}
          {grammarTopic && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100 uppercase tracking-wide">
              <Icon name="Sparkles" className="w-3 h-3 mr-1" />
              {grammarTopic}
            </span>
          )}

          {/* Delete Button (Visible on Hover) */}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevents clicking the card background if we add that later
                onDelete();
              }}
              className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              title="Delete word"
            >
              <Icon name="X" className="w-4 h-4" />
            </button>
          )}
        </div>

        <header className="flex justify-between items-start mb-3">
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-slate-100 text-slate-500 border border-slate-200">{type || 'Word'}</span>
            </div>
            <h3 className="text-3xl font-bold text-slate-800">
              {renderArticle() && <>{renderArticle()} </>}{original}
            </h3>
          </div>
        </header>

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
              {renderHighlightedText(example)}
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