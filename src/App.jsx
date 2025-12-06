import React from 'react';
import { SettingsProvider } from './context/SettingsContext';
import { useAppLogic } from './hooks/useAppLogic';
import { Icon } from './components/ui/Icon';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';

const App = () => {
  const logic = useAppLogic();

  if (logic.authLoading) {
    return <div className="flex h-screen items-center justify-center"><Icon name="Loader2" className="animate-spin w-10 h-10 text-indigo-600"/></div>;
  }

  if (!logic.user) {
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