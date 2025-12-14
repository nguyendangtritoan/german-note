import React from 'react';
import Modal from './ui/Modal';
import { useSettings } from '../context/SettingsContext';
import { Icon } from './ui/Icon';

const SettingsModal = ({ isOpen, onClose }) => {
  const { 
    targetLanguages, availableLanguages, toggleLanguage, isLangSelected,
    visibility, toggleVisibility,
    darkMode, toggleDarkMode 
  } = useSettings();
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="space-y-6 p-6">
        
        {/* Appearance Section */}
        <section>
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-3">Appearance</h3>
          <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full transition-colors ${darkMode ? 'bg-indigo-900/50 text-indigo-400' : 'bg-orange-100 text-orange-500'}`}>
                <Icon name={darkMode ? "Moon" : "Sun"} className="w-5 h-5" />
              </div>
              {/* Dynamic Text Label */}
              <span className="font-medium text-slate-600 dark:text-slate-300">
                {darkMode ? 'Dark Mode' : 'Light Mode'}
              </span>
            </div>
            
            <button onClick={toggleDarkMode} className={`w-11 p-1 rounded-full transition-colors flex items-center ${darkMode ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'}`}>
              <span className="block w-5 h-5 bg-white rounded-full shadow transition-transform"></span>
            </button>
          </label>
        </section>

        <section>
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-3">Target Languages</h3>
          <div className="flex flex-wrap gap-2">
            {availableLanguages.map(lang => (
              <button key={lang.code} onClick={() => toggleLanguage(lang)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${isLangSelected(lang) ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                {lang.name}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-3">Card Visibility & Content</h3>
          <div className="space-y-2">
            {[
              { id: 'article', label: 'Show Article (der, die, das)' },
              { id: 'plural', label: 'Show Plural Forms' },
              { id: 'verbForms', label: 'Show Principal Parts' },
              { id: 'example', label: 'Show Example Sentence' }
            ].map(item => (
              <label key={item.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <span className="font-medium text-slate-600 dark:text-slate-300">{item.label}</span>
                <button onClick={() => toggleVisibility(item.id)} className={`w-11 p-1 rounded-full transition-colors flex items-center ${visibility[item.id] ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'}`}>
                  <span className="block w-5 h-5 bg-white rounded-full shadow transition-transform"></span>
                </button>
              </label>
            ))}
          </div>
        </section>

      </div>
    </Modal>
  );
};

export default SettingsModal;