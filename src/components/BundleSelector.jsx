import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './ui/Icon';

const BundleSelector = ({ activeBundleId, onSelect, pastBundles, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => { if (menuRef.current && !menuRef.current.contains(event.target)) { setIsOpen(false); } };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (id) => { onSelect(id); setIsOpen(false); };

  let activeLabel = "Today's Session";
  if (activeBundleId) {
    const b = pastBundles.find(b => b.id === activeBundleId);
    if (b) { activeLabel = new Date(b.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }); }
  }

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`h-full w-full flex items-center justify-between gap-3 px-4 rounded-2xl border transition-all duration-200 
            ${isOpen 
              ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 ring-2 ring-indigo-100 dark:ring-indigo-900' 
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md'
            }`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className={`p-1.5 rounded-lg shrink-0 ${activeBundleId ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
            <Icon name={activeBundleId ? "Book" : "Zap"} className="w-5 h-5" />
          </div>
          <div className="flex flex-col items-start truncate">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-tight">Current View</span>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate leading-tight">{activeLabel}</span>
          </div>
        </div>
        <Icon name="ChevronDown" className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full min-w-[280px] bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-left">
          <div className="p-2 border-b border-slate-50 dark:border-slate-700">
            <button onClick={() => handleSelect(null)} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${!activeBundleId ? 'bg-green-50 dark:bg-green-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
              <div className="bg-green-100 dark:bg-green-900/40 p-2 rounded-full text-green-600 dark:text-green-400"><Icon name="Zap" className="w-4 h-4" /></div>
              <div className="text-left flex-1">
                <p className={`text-sm font-bold ${!activeBundleId ? 'text-green-700 dark:text-green-400' : 'text-slate-700 dark:text-slate-200'}`}>Today's Session</p>
                <p className="text-xs text-slate-400">Live • Unsaved</p>
              </div>
              {!activeBundleId && <Icon name="Check" className="w-4 h-4 text-green-600 dark:text-green-400" />}
            </button>
          </div>
          <div className="p-2 max-h-72 overflow-y-auto custom-scrollbar">
            <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Previous Bundles</div>
            {pastBundles.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-sm italic">No saved bundles yet</div>
            ) : (
              pastBundles.map((bundle) => {
                const isActive = activeBundleId === bundle.id;
                const d = new Date(bundle.date);
                return (
                  <button key={bundle.id} onClick={() => handleSelect(bundle.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl mb-1 transition-colors ${isActive ? 'bg-amber-50 dark:bg-amber-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                    <div className={`p-2 rounded-full ${isActive ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}><Icon name="Book" className="w-4 h-4" /></div>
                    <div className="text-left flex-1">
                      <p className={`text-sm font-bold ${isActive ? 'text-amber-800 dark:text-amber-400' : 'text-slate-700 dark:text-slate-200'}`}>{d.toLocaleDateString()}</p>
                      <p className="text-xs text-slate-500">{bundle.wordCount} words</p>
                    </div>
                    {isActive && <Icon name="Check" className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BundleSelector;