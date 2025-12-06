import React from 'react';
import Modal from './ui/Modal';
import { useSettings } from '../context/SettingsContext';

const SettingsModal = ({ isOpen, onClose }) => {
  const { targetLanguages, visibility, availableLanguages, toggleLanguage, toggleVisibility, isLangSelected } = useSettings();
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="space-y-6">
        <section>
          <h3 className="text-lg font-medium text-slate-700 mb-3">Target Languages</h3>
          <div className="flex flex-wrap gap-2">
            {availableLanguages.map(lang => (
              <button key={lang.code} onClick={() => toggleLanguage(lang)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${isLangSelected(lang) ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {lang.name}
              </button>
            ))}
          </div>
        </section>
        <section>
          <h3 className="text-lg font-medium text-slate-700 mb-3">Card Visibility</h3>
          <div className="space-y-2">
            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
              <span className="font-medium text-slate-600">Show Article (der, die, das)</span>
              <button onClick={() => toggleVisibility('article')} className={`w-11 p-1 rounded-full transition-colors flex items-center ${visibility.article ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'}`}>
                <span className="block w-5 h-5 bg-white rounded-full shadow transition-transform"></span>
              </button>
            </label>
            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
              <span className="font-medium text-slate-600">Show Example Sentence</span>
               <button onClick={() => toggleVisibility('example')} className={`w-11 p-1 rounded-full transition-colors flex items-center ${visibility.example ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'}`}>
                <span className="block w-5 h-5 bg-white rounded-full shadow transition-transform"></span>
              </button>
            </label>
          </div>
        </section>
      </div>
    </Modal>
  );
};

export default SettingsModal;