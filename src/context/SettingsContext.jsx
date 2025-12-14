import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [targetLanguages, setTargetLanguages] = useLocalStorage('targetLanguages', [
    { code: 'en', name: 'English' },
    { code: 'vi', name: 'Vietnamese' }
  ]);
  
  // DEFAULT CONFIGURATION
  const defaultVisibility = {
    article: true,
    example: true,
    plural: true,     // New
    verbForms: true   // New
  };

  const [visibility, setVisibility] = useLocalStorage('visibility', defaultVisibility);

  // MIGRATION FIX: Ensure new settings (plural/verbForms) are added to existing users
  useEffect(() => {
    setVisibility(prev => {
      // If the stored settings are missing keys, merge them with defaults
      if (prev.plural === undefined || prev.verbForms === undefined) {
        return { ...defaultVisibility, ...prev };
      }
      return prev;
    });
  }, []);

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
    selectedGrammar, 
    setSelectedGrammar, 
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