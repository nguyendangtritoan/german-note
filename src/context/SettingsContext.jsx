import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [targetLanguages, setTargetLanguages] = useLocalStorage('targetLanguages', [
    { code: 'en', name: 'English' },
    { code: 'vi', name: 'Vietnamese' }
  ]);
  
  const defaultVisibility = {
    article: true,
    example: true,
    plural: true,
    verbForms: true
  };

  const [visibility, setVisibility] = useLocalStorage('visibility', defaultVisibility);
  
  // NEW: Dark Mode State
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);

  // NEW: Effect to apply dark mode to HTML tag
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Migration Fix for visibility
  useEffect(() => {
    setVisibility(prev => {
      if (prev.plural === undefined || prev.verbForms === undefined) {
        return { ...defaultVisibility, ...prev };
      }
      return prev;
    });
  }, []);

  const [selectedGrammar, setSelectedGrammar] = useState(null);

  const [availableLanguages] = useState([
    { code: 'en', name: 'English' },
    { code: 'vi', name: 'Vietnamese' }
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
  
  // NEW: Toggle function
  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const value = useMemo(() => ({
    targetLanguages,
    visibility,
    availableLanguages,
    selectedGrammar, 
    darkMode, // Exported
    setSelectedGrammar, 
    toggleLanguage,
    toggleVisibility,
    toggleDarkMode, // Exported
    isLangSelected: (lang) => targetLanguages.some(l => l.code === lang.code)
  }), [targetLanguages, visibility, availableLanguages, selectedGrammar, darkMode]); // Fixed: Removed "QH"

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);