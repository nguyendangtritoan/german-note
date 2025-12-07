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
import ConfirmationModal from './ConfirmationModal';
import { useBundle } from '../context/BundleContext';

const Dashboard = ({ logic }) => {
  const [currentView, setCurrentView] = useState('live');
  const [activeBundle, setActiveBundle] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFlashcardOpen, setIsFlashcardOpen] = useState(false);
  const [isLogoutWarningOpen, setIsLogoutWarningOpen] = useState(false);
  const { activeBundleId } = useBundle();

  const { 
    user, 
    handleSearch, 
    handleSummarize, 
    handleDeleteBundle, 
    handleLinkGoogleAccount, 
    isLoading, 
    currentSessionWords, 
    pastBundles 
  } = logic;

  const isGuest = user?.isAnonymous;

  const activeBundleWords = activeBundleId 
    ? (pastBundles.find(b => b.id === activeBundleId)?.words || []) 
    : [];

  const sessionWordSet = new Set(currentSessionWords.map(w => w.original.toLowerCase()));
  const filteredHistory = activeBundleWords.filter(w => !sessionWordSet.has(w.original.toLowerCase()));
  const displayedWords = [...currentSessionWords, ...filteredHistory];

  const handleSummarizeWrap = async () => {
    const success = await handleSummarize();
    if (success) setCurrentView('bundles');
  };

  const handleLogoutClick = () => {
    if (isGuest) {
      setIsLogoutWarningOpen(true);
    } else {
      signOut(auth);
    }
  };

  const confirmGuestLogout = () => {
    signOut(auth);
    setIsLogoutWarningOpen(false);
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
             {isGuest && (
                <button 
                  onClick={handleLinkGoogleAccount}
                  className="hidden md:flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors mr-2 border border-indigo-200"
                >
                  <Icon name="Sparkles" className="w-3 h-3" />
                  Save Progress
                </button>
             )}

             <div className={`hidden md:flex items-center px-3 py-1 rounded-full border ${isGuest ? 'bg-amber-50 border-amber-200' : 'bg-slate-100 border-slate-200'}`}>
               {user?.photoURL ? <img src={user.photoURL} alt="User" className="w-6 h-6 rounded-full mr-2"/> : <Icon name="User" className={`w-4 h-4 mr-2 ${isGuest ? 'text-amber-500' : ''}`}/>}
               <span className={`text-xs font-medium ${isGuest ? 'text-amber-700' : 'text-slate-600'}`}>
                 {user?.displayName || (isGuest ? 'Guest Session' : 'User')}
               </span>
             </div>
             
             <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}><Icon name="Settings"/></Button>
             <Button variant="ghost" size="icon" onClick={handleLogoutClick} className="text-red-500 hover:bg-red-50" title={isGuest ? "End Guest Session" : "Log Out"}>
               <Icon name="LogOut"/>
             </Button>
          </div>
        </nav>
      </header>
      <main className="max-w-2xl mx-auto p-4 sm:p-6">
        {currentView === 'live' ? (
          <div className="space-y-6">
            <InputHero onSearch={handleSearch} isLoading={isLoading}/>
            <LiveFeed 
              words={displayedWords} 
              isLoading={isLoading} 
              onSummarize={handleSummarizeWrap}
              onDeleteBundle={handleDeleteBundle} 
              pastBundles={pastBundles} 
            />
          </div>
        ) : (
          <BundleManager bundles={pastBundles} onSelectBundle={(b) => { setActiveBundle(b); setIsFlashcardOpen(true); }}/>
        )}
      </main>
      
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}/>
      <FlashcardModal isOpen={isFlashcardOpen} onClose={() => setIsFlashcardOpen(false)} bundle={activeBundle}/>

      {/* Guest Data Loss Warning Modal */}
      <ConfirmationModal 
        isOpen={isLogoutWarningOpen}
        onClose={() => setIsLogoutWarningOpen(false)}
        onConfirm={confirmGuestLogout}
        title="End Guest Session?"
        message="You are in a temporary Guest Session. Ending this session will permanently delete all your words and bundles. To keep them, click 'Save Progress' in the header instead."
        confirmText="End Session" // FIX: Correct label for guests
      />
    </div>
  );
};

export default Dashboard;