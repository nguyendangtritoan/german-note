import React, { createContext, useContext, useState, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [targetLanguages, setTargetLanguages] = useLocalStorage('targetLanguages', [
    { code: 'en', name: 'English' },
    { code: 'vi', name: 'Vietnamese' }
  ]);
  
  const [visibility, setVisibility] = useLocalStorage('visibility', {
    article: true,
    example: true
  });

  // NEW: Store selected grammar topic (String or null)
  // We allow only 1 topic at a time to keep the AI focused, or multiple if you prefer.
  // Let's start with single selection for clarity.
  const [selectedGrammar, setSelectedGrammar] = useState(null);

  const [availableLanguages] = useState([
    { code: 'en', name: 'English' },
    { code: 'vi', name: 'Vietnamese' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' }
  ]);

  const toggleLanguage = (lang) => {
    setTargetLanguages(prev =>
      prev.find(l => l.code === lang.code)
        ? prev.filter(l => l.code !== lang.code)
        : [...prev, lang]
    );
  };

  const toggleVisibility = (key) => {
    setVisibility(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const value = useMemo(() => ({
    targetLanguages,
    visibility,
    availableLanguages,
    selectedGrammar, // Export state
    setSelectedGrammar, // Export setter
    toggleLanguage,
    toggleVisibility,
    isLangSelected: (lang) => targetLanguages.some(l => l.code === lang.code)
  }), [targetLanguages, visibility, availableLanguages, selectedGrammar]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);