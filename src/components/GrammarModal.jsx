import React from 'react';
import Modal from './ui/Modal';
import { useSettings } from '../context/SettingsContext';
import { GRAMMAR_LEVELS } from '../utils/grammarData';
import { Icon } from './ui/Icon';

const GrammarModal = ({ isOpen, onClose }) => {
  const { selectedGrammar, setSelectedGrammar } = useSettings();

  const handleToggle = (topic) => {
    if (selectedGrammar === topic) {
      setSelectedGrammar(null);
    } else {
      setSelectedGrammar(topic);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Grammar Focus Mode">
      {/* SCROLLABLE CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="mb-6 p-4 bg-indigo-50/50 border border-indigo-100 rounded-lg flex items-start gap-3">
          <Icon name="Sparkles" className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
          <p className="text-sm text-indigo-900 leading-relaxed">
            Select a grammar topic below. The AI will generate example sentences specifically using that structure (e.g. "Show me this verb in <b>Future II</b>").
          </p>
        </div>

        <div className="space-y-8">
          {GRAMMAR_LEVELS.map((level) => (
            <div key={level.id} className="space-y-3">
              <div className={`px-3 py-1.5 rounded-md inline-flex items-center text-xs font-bold uppercase tracking-wider border ${level.color}`}>
                {level.title}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {level.topics.map((topic) => {
                  const isActive = selectedGrammar === topic;
                  return (
                    <button
                      key={topic}
                      onClick={() => handleToggle(topic)}
                      className={`
                        px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border text-left
                        ${isActive 
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-offset-2 ring-indigo-200' 
                          : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                        }
                      `}
                    >
                      {topic}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* FIXED FOOTER */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-xl flex justify-end items-center gap-3 shrink-0">
        <button 
          onClick={() => { setSelectedGrammar(null); onClose(); }} 
          className="text-slate-500 hover:text-red-600 text-sm font-medium px-4 py-2 transition-colors"
        >
          Clear Selection
        </button>
        <button 
          onClick={onClose} 
          className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          Done
        </button>
      </div>
    </Modal>
  );
};

export default GrammarModal;