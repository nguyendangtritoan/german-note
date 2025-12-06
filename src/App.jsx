import React from 'react';
import { SettingsProvider } from './context/SettingsContext';
import { useAppLogic } from './hooks/useAppLogic';
import { Icon } from './components/ui/Icon';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';

const App = () => {
  const logic = useAppLogic();

  // "Silent Boot" Logic:
  // Render LoginScreen ONLY if not loading AND no user.
  // If loading, render Dashboard optimistically.
  if (!logic.user && !logic.authLoading) {
    return <LoginScreen onGoogleLogin={logic.handleGoogleLogin} onGuestLogin={logic.handleGuestLogin} />;
  }

  return <Dashboard logic={logic} />;
};

export default function Main() { 
  return (
    <SettingsProvider>
      <App />
    </SettingsProvider>
  ); 
}