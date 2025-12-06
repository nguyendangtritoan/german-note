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
    toggleLanguage,
    toggleVisibility,
    isLangSelected: (lang) => targetLanguages.some(l => l.code === lang.code)
  }), [targetLanguages, visibility, availableLanguages]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);