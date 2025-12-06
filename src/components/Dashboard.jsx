import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { Icon } from './ui/Icon';
import Button from './ui/Button';
import InputHero from './InputHero';
import LiveFeed from './LiveFeed';
import BundleManager from './BundleManager';
import SettingsModal from './SettingsModal';
import FlashcardModal from './FlashcardModal';

const Dashboard = ({ logic }) => {
  const [currentView, setCurrentView] = useState('live');
  const [activeBundle, setActiveBundle] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFlashcardOpen, setIsFlashcardOpen] = useState(false);

  const { 
    user, 
    handleSearch, 
    handleSummarize, 
    isLoading, 
    currentSessionWords, 
    pastBundles 
  } = logic;

  const handleSummarizeWrap = async () => {
    const success = await handleSummarize();
    if (success) setCurrentView('bundles');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white shadow sticky top-0 z-40">
        <nav className="max-w-4xl mx-auto p-3 flex justify-between items-center">
          <div className="flex gap-2">
            <Button variant={currentView === 'live' ? 'primary' : 'ghost'} onClick={() => setCurrentView('live')}><Icon name="LayoutDashboard" className="mr-2"/>Feed</Button>
            <Button variant={currentView === 'bundles' ? 'primary' : 'ghost'} onClick={() => setCurrentView('bundles')}><Icon name="Book" className="mr-2"/>Bundles</Button>
          </div>
          <div className="flex items-center gap-2">
             <div className="hidden md:flex items-center px-3 py-1 bg-slate-100 rounded-full">
               {user.photoURL ? <img src={user.photoURL} alt="User" className="w-6 h-6 rounded-full mr-2"/> : <Icon name="User" className="w-4 h-4 mr-2"/>}
               <span className="text-xs font-medium">{user.displayName || 'Guest'}</span>
             </div>
             <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}><Icon name="Settings"/></Button>
             <Button variant="ghost" size="icon" onClick={() => signOut(auth)} className="text-red-500"><Icon name="LogOut"/></Button>
          </div>
        </nav>
      </header>
      <main className="max-w-2xl mx-auto p-4 sm:p-6">
        {currentView === 'live' ? (
          <div className="space-y-6">
            <InputHero onSearch={handleSearch} isLoading={isLoading}/>
            <LiveFeed words={currentSessionWords} isLoading={isLoading} onSummarize={handleSummarizeWrap}/>
          </div>
        ) : (
          <BundleManager bundles={pastBundles} onSelectBundle={(b) => { setActiveBundle(b); setIsFlashcardOpen(true); }}/>
        )}
      </main>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}/>
      <FlashcardModal isOpen={isFlashcardOpen} onClose={() => setIsFlashcardOpen(false)} bundle={activeBundle}/>
    </div>
  );
};

export default Dashboard;