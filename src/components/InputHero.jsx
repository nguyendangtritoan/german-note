import React, { useState, useRef, useEffect } from 'react';
import Button from './ui/Button';
import { Icon } from './ui/Icon';
import { useSettings } from '../context/SettingsContext';

const InputHero = ({ onSearch, isLoading, onOpenGrammar, searchHistory = [], className = "" }) => {
  const [word, setWord] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { selectedGrammar, setSelectedGrammar } = useSettings();
  const inputRef = useRef(null);

  useEffect(() => { if (!isLoading && inputRef.current) inputRef.current.focus(); }, [isLoading]);

  const handleInputChange = (e) => {
    let value = e.target.value;
    value = value.replace(/ae/g, 'ä').replace(/oe/g, 'ö').replace(/ue/g, 'ü').replace(/Ae/g, 'Ä').replace(/Oe/g, 'Ö').replace(/Ue/g, 'Ü');
    setWord(value);
    if (value.trim()) {
      const lowerValue = value.toLowerCase();
      const matches = searchHistory.filter(item => item.toLowerCase().includes(lowerValue) && item.toLowerCase() !== lowerValue).slice(0, 5);
      setSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => { setWord(suggestion); setShowSuggestions(false); inputRef.current?.focus(); };
  const handleSubmit = (e) => { e.preventDefault(); setShowSuggestions(false); if (word.trim() && !isLoading) { onSearch(word.trim()); setWord(""); } };

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col relative group ${className}`}>
      <div className="relative flex items-center shadow-sm rounded-2xl transition-shadow hover:shadow-md bg-white dark:bg-slate-800 z-20">
        <div className="absolute left-4 text-slate-400">
           <Icon name="Zap" className="w-5 h-5" />
        </div>
        <input 
          ref={inputRef}
          type="text" 
          value={word} 
          onChange={handleInputChange}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} 
          onFocus={() => { if(word.trim() && suggestions.length > 0) setShowSuggestions(true); }}
          placeholder={isLoading ? "Analyzing..." : "Type a word..."}
          className={`w-full pl-12 pr-28 h-14 text-lg font-medium border rounded-2xl focus:outline-none transition-all dark:text-white dark:bg-slate-800
            ${selectedGrammar 
              ? 'border-indigo-300 ring-4 ring-indigo-50/50 dark:ring-indigo-900/30 bg-indigo-50/10' 
              : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 dark:focus:ring-indigo-900/30'
            }`}
          disabled={isLoading} 
          autoFocus 
          autoComplete="off"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <button type="button" onClick={onOpenGrammar} className={`p-2 rounded-xl transition-all ${selectedGrammar ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300'}`} title="Grammar Focus">
            <Icon name="Settings" className="w-5 h-5" />
          </button>
          <Button type="submit" size="icon" disabled={isLoading} className="rounded-xl h-10 w-10 shadow-sm">
            {isLoading ? <Icon name="Loader2" className="animate-spin w-5 h-5" /> : <Icon name="ArrowRight" className="w-5 h-5" />}
          </Button>
        </div>
        
        {/* Suggestions */}
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            {suggestions.map((suggestion, index) => (
              <button key={index} type="button" onMouseDown={() => handleSuggestionClick(suggestion)} className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium flex items-center gap-3 transition-colors border-bSx border-slate-50 dark:border-slate-700 last:border-0">
                <Icon name="Clock" className="w-4 h-4 text-slate-400" />
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedGrammar && (
        <div className="absolute top-full mt-2 left-2 z-10 animate-in slide-in-from-top-1">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full shadow-lg shadow-indigo-200 dark:shadow-none ring-2 ring-white dark:ring-slate-800">
            <Icon name="Sparkles" className="w-3 h-3" />
            Focus: {selectedGrammar}
            <button type="button" onClick={() => setSelectedGrammar(null)} className="ml-1 text-indigo-200 hover:text-white transition-colors border-l border-indigo-500 pl-1.5" title="Clear filter">
              <Icon name="X" className="w-3 h-3" />
            </button>
          </span>
        </div>
      )}
    </form>
  );
};

export default InputHero;