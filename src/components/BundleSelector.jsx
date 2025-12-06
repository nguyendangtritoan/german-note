import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './ui/Icon';

const BundleSelector = ({ activeBundleId, onSelect, pastBundles }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (id) => {
    onSelect(id);
    setIsOpen(false);
  };

  // Find active label with fallback
  let activeLabel = "Today (Live)";
  if (activeBundleId) {
    const b = pastBundles.find(b => b.id === activeBundleId);
    if (b) {
      const d = new Date(b.date);
      activeLabel = `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${isOpen ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-100' : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'}`}
      >
        <div className={`p-1 rounded-md ${activeBundleId ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
          <Icon name={activeBundleId ? "Book" : "Zap"} className="w-4 h-4" />
        </div>
        
        <div className="flex flex-col items-start mr-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Viewing</span>
          <span className="text-sm font-semibold text-slate-700 truncate max-w-[140px]">{activeLabel}</span>
        </div>

        <Icon name="ChevronDown" className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-left">
          
          <div className="p-2 border-b border-slate-50">
            <button 
              onClick={() => handleSelect(null)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${!activeBundleId ? 'bg-green-50' : 'hover:bg-slate-50'}`}
            >
              <div className="bg-green-100 p-2 rounded-full text-green-600">
                <Icon name="Zap" className="w-4 h-4" />
              </div>
              <div className="text-left flex-1">
                <p className={`text-sm font-medium ${!activeBundleId ? 'text-green-700' : 'text-slate-700'}`}>Today (Live Session)</p>
                <p className="text-xs text-slate-400">Unsaved words</p>
              </div>
              {!activeBundleId && <Icon name="Check" className="w-4 h-4 text-green-600" />}
            </button>
          </div>

          <div className="p-2 max-h-64 overflow-y-auto custom-scrollbar">
            <div className="px-3 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Past Bundles</div>
            
            {pastBundles.length === 0 ? (
              <div className="text-center py-4 text-slate-400 text-sm">No history yet</div>
            ) : (
              pastBundles.map((bundle) => {
                const isActive = activeBundleId === bundle.id;
                const d = new Date(bundle.date);
                return (
                  <button 
                    key={bundle.id}
                    onClick={() => handleSelect(bundle.id)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg mb-1 transition-colors ${isActive ? 'bg-amber-50' : 'hover:bg-slate-50'}`}
                  >
                    <div className={`p-2 rounded-full ${isActive ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                      <Icon name="Book" className="w-4 h-4" />
                    </div>
                    <div className="text-left flex-1">
                      <p className={`text-sm font-medium ${isActive ? 'text-amber-800' : 'text-slate-700'}`}>
                        {d.toLocaleDateString()} <span className="text-slate-400 font-normal">{d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                      </p>
                      <p className="text-xs text-slate-400">{bundle.wordCount} words</p>
                    </div>
                    {isActive && <Icon name="Check" className="w-4 h-4 text-amber-600" />}
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