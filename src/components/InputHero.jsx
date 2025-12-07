import React, { useState, useRef, useEffect } from 'react';
import Button from './ui/Button';
import { Icon } from './ui/Icon';
import GrammarModal from './GrammarModal';
import { useSettings } from '../context/SettingsContext';

const InputHero = ({ onSearch, isLoading }) => {
  const [word, setWord] = useState("");
  const [isGrammarOpen, setIsGrammarOpen] = useState(false);
  const { selectedGrammar, setSelectedGrammar } = useSettings();
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (word.trim() && !isLoading) { 
      onSearch(word.trim()); 
      setWord(""); 
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* INPUT CONTAINER */}
        <div className="relative group">
          <input 
            ref={inputRef}
            type="text" 
            value={word} 
            onChange={(e) => setWord(e.target.value)} 
            placeholder={isLoading ? "Processing..." : "Type a German word..."}
            className={`w-full pl-6 pr-32 py-5 text-lg border-2 rounded-xl shadow-sm focus:outline-none transition-all 
              ${selectedGrammar 
                ? 'border-indigo-400 ring-4 ring-indigo-50' 
                : 'border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400'
              }`}
            disabled={isLoading} 
            autoFocus 
          />
          
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsGrammarOpen(true)}
              className={`p-2 rounded-lg transition-all ${
                selectedGrammar 
                  ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200' 
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
              }`}
              title="Grammar Focus"
            >
              <Icon name="Settings" className="w-5 h-5" />
            </button>

            <Button type="submit" size="icon" disabled={isLoading} className="rounded-lg h-10 w-10 shadow-sm">
              {isLoading ? <Icon name="Loader2" className="animate-spin" /> : <Icon name="ArrowRight" />}
            </Button>
          </div>
        </div>

        {/* ACTIVE BADGE (Standard Flow - No Overlap) */}
        {selectedGrammar && (
          <div className="flex items-center gap-2 animate-in slide-in-from-top-2 fade-in duration-200 pl-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Focus Mode:</span>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full shadow-sm">
              <Icon name="Sparkles" className="w-3 h-3" />
              {selectedGrammar}
              <button 
                type="button"
                onClick={() => setSelectedGrammar(null)} 
                className="ml-1 p-0.5 hover:bg-white/20 rounded-full transition-colors"
                title="Clear filter"
              >
                <Icon name="X" className="w-3 h-3" />
              </button>
            </span>
          </div>
        )}
      </form>

      <GrammarModal 
        isOpen={isGrammarOpen} 
        onClose={() => setIsGrammarOpen(false)} 
      />
    </>
  );
};

export default InputHero;