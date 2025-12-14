import React, { useState, useMemo } from 'react';
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
import BundleSelector from './BundleSelector';
import GrammarModal from './GrammarModal';
import { useBundle } from '../context/BundleContext';

const Dashboard = ({ logic }) => {
  const [currentView, setCurrentView] = useState('live');
  
  // Modal States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFlashcardOpen, setIsFlashcardOpen] = useState(false);
  const [isLogoutWarningOpen, setIsLogoutWarningOpen] = useState(false);
  const [isDeleteBundleModalOpen, setIsDeleteBundleModalOpen] = useState(false);
  const [isGrammarModalOpen, setIsGrammarModalOpen] = useState(false);
  
  // Flashcard State
  const [activeBundleForFlashcard, setActiveBundleForFlashcard] = useState(null); // Separate state for flashcard viewing
  
  const { activeBundleId, setActiveBundleId } = useBundle();

  const { 
    user, 
    handleSearch, 
    handleSummarize, 
    handleDeleteBundle,
    handleDeleteWord, 
    handleDeleteWordFromBundle,
    handleLinkGoogleAccount, 
    handleRegenerateWord,
    isLoading, 
    currentSessionWords, 
    pastBundles 
  } = logic;

  // Calculate Search History (Unique words from current session + past bundles)
  const searchHistory = useMemo(() => {
    const historySet = new Set();
    
    // 1. Current Session
    currentSessionWords.forEach(word => {
      if (word.original) historySet.add(word.original);
    });

    // 2. Past Bundles
    pastBundles.forEach(bundle => {
      if (bundle.words) {
        bundle.words.forEach(word => {
          if (word.original) historySet.add(word.original);
        });
      }
    });

    return Array.from(historySet);
  }, [currentSessionWords, pastBundles]);

  const isGuest = user?.isAnonymous;

  // Calculate words to display in Live Feed
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

  const handleDeleteBundleClick = () => {
    if (activeBundleId) setIsDeleteBundleModalOpen(true);
  };

  const handleConfirmDeleteBundle = () => {
    if (activeBundleId) {
      handleDeleteBundle(activeBundleId);
      setIsDeleteBundleModalOpen(false);
    }
  };

  const showSaveButton = displayedWords.length > 0 || activeBundleId;

  // Helper to style the navigation tabs
  const getToggleBtnClass = (viewName) => {
    const isActive = currentView === viewName;
    return `relative flex items-center justify-center px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200 focus:outline-none ${
      isActive 
        ? 'bg-indigo-600 text-white shadow-md ring-2 ring-white' 
        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
    }`;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* GLOBAL NAV HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-100 h-[64px] flex items-center">
        <nav className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 flex justify-between items-center">
          
          {/* LEFT SIDE: NAVIGATION (Grouped) */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentView('live')}
              className={getToggleBtnClass('live')}
            >
              <Icon name="LayoutDashboard" className={`mr-2 w-4 h-4 ${currentView === 'live' ? 'text-indigo-100' : 'text-slate-400'}`} />
              Feed
            </button>
            <button 
              onClick={() => setCurrentView('bundles')}
              className={getToggleBtnClass('bundles')}
            >
              <Icon name="Book" className={`mr-2 w-4 h-4 ${currentView === 'bundles' ? 'text-indigo-100' : 'text-slate-400'}`} />
              Bundles
            </button>
          </div>
          
          {/* RIGHT SIDE: USER CONTROLS */}
          <div className="flex items-center gap-3">
             {isGuest && (
                <button 
                  onClick={handleLinkGoogleAccount}
                  className="hidden md:flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg hover:bg-indigo-100 transition-colors mr-2 border border-indigo-200"
                >
                  <Icon name="Sparkles" className="w-3.5 h-3.5" />
                  Save Progress
                </button>
             )}

             <div className={`hidden md:flex items-center pl-1 pr-3 py-1 rounded-full border ${isGuest ? 'bg-amber-50 border-amber-200' : 'bg-slate-100 border-slate-200'}`}>
               {user?.photoURL ? <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full mr-2"/> : <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${isGuest ? 'bg-amber-100' : 'bg-white shadow-sm'}`}><Icon name="User" className={`w-4 h-4 ${isGuest ? 'text-amber-600' : 'text-slate-400'}`}/></div>}
               <span className={`text-xs font-bold ${isGuest ? 'text-amber-700' : 'text-slate-600'}`}>
                 {user?.displayName || (isGuest ? 'Guest' : 'User')}
               </span>
             </div>
             
             <div className="flex items-center border-l border-slate-200 pl-3 gap-1">
                <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)} className="rounded-xl w-10 h-10"><Icon name="Settings"/></Button>
                <Button variant="ghost" size="icon" onClick={handleLogoutClick} className="text-red-500 hover:bg-red-50 rounded-xl w-10 h-10" title={isGuest ? "End Guest Session" : "Log Out"}>
                  <Icon name="LogOut"/>
                </Button>
             </div>
          </div>
        </nav>
      </header>

      <main className="w-full">
        {currentView === 'live' ? (
          <>
            {/* 1. HERO INPUT SECTION (Sticky, below Header) */}
            <div className="sticky top-[64px] z-40 bg-slate-50/95 backdrop-blur-md border-b border-slate-200/60 shadow-sm transition-all">
              <div className="max-w-2xl lg:max-w-4xl mx-auto px-4 sm:px-6 py-4">
                
                <InputHero 
                  onSearch={handleSearch} 
                  isLoading={isLoading} 
                  onOpenGrammar={() => setIsGrammarModalOpen(true)}
                  searchHistory={searchHistory}
                />

                {/* MOBILE CONTROLS (Hidden on Desktop) */}
                <div className="flex lg:hidden items-center justify-between gap-2 mt-3">
                    <BundleSelector 
                      activeBundleId={activeBundleId}
                      onSelect={setActiveBundleId}
                      pastBundles={pastBundles}
                      className="flex-1 h-12"
                    />
                    {showSaveButton && (
                      <Button 
                        variant="primary" 
                        onClick={handleSummarizeWrap} 
                        className="h-12 w-12 rounded-xl bg-indigo-600 shadow-sm flex items-center justify-center"
                      >
                        <Icon name="Sparkles" className="w-5 h-5" />
                      </Button>
                    )}
                     {activeBundleId && (
                      <Button 
                        variant="ghost" 
                        onClick={handleDeleteBundleClick}
                        className="h-12 w-12 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-red-600 flex items-center justify-center"
                      >
                        <Icon name="X" className="w-5 h-5"/>
                      </Button>
                    )}
                </div>
              </div>
            </div>
            
            {/* 2. THREE-COLUMN CONTENT GRID */}
            <div className="max-w-[90rem] mx-auto px-4 sm:px-6 pt-8 pb-20 flex items-start justify-center gap-8">
               
               {/* LEFT COLUMN: Bundle Selector (Sticky) */}
               <aside className="hidden lg:block w-72 shrink-0 sticky top-44 transition-all">
                  <div className="space-y-3">
                     <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Active Session</h3>
                     
                     <BundleSelector 
                       activeBundleId={activeBundleId}
                       onSelect={setActiveBundleId}
                       pastBundles={pastBundles}
                       className="h-14 w-full" 
                     />
                     
                     <p className="text-xs text-slate-400 px-1 leading-relaxed">
                       {activeBundleId 
                         ? "You are viewing a saved bundle. New searches will be added here." 
                         : "Words you search are added to the live session until you save them."}
                     </p>
                  </div>
               </aside>

               {/* CENTER COLUMN: Feed (Scrollable) */}
               <div className="flex-1 max-w-2xl min-w-0">
                  <LiveFeed 
                    words={displayedWords} 
                    isLoading={isLoading} 
                    activeBundleId={activeBundleId}
                    onDeleteWord={handleDeleteWord} 
                    onDeleteWordFromBundle={handleDeleteWordFromBundle}
                    onRegenerateWord={handleRegenerateWord}
                  />
               </div>

               {/* RIGHT COLUMN: Actions (Sticky) */}
               <aside className="hidden lg:block w-64 shrink-0 sticky top-44 transition-all">
                  <div className="space-y-4">
                     <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Actions</h3>
                     
                     {showSaveButton && (
                        <div className="p-4 bg-white rounded-2xl border border-indigo-100 shadow-sm space-y-3">
                           <Button 
                             variant="primary" 
                             onClick={handleSummarizeWrap} 
                             className="w-full h-14 rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 text-base font-bold transition-transform hover:scale-[1.02] active:scale-95"
                           >
                             <Icon name="Sparkles" className="w-5 h-5" />
                             {activeBundleId ? "Update Bundle" : "Save Bundle"}
                           </Button>
                           <p className="text-xs text-center text-slate-400">
                             {activeBundleId 
                               ? "Save new words to this bundle." 
                               : "Create a permanent bundle from these words."}
                           </p>
                        </div>
                     )}

                     {activeBundleId && (
                       <Button 
                          variant="ghost" 
                          onClick={handleDeleteBundleClick}
                          className="w-full h-12 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 flex items-center justify-center gap-2 transition-colors"
                       >
                          <Icon name="X" className="w-5 h-5"/>
                          Delete Bundle
                       </Button>
                     )}
                  </div>
               </aside>

            </div>
          </>
        ) : (
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
            <BundleManager 
              bundles={pastBundles} 
              onSelectBundle={(b) => { 
                setActiveBundleForFlashcard(b); 
                setIsFlashcardOpen(true); 
              }}
            />
          </div>
        )}
      </main>
      
      {/* MODALS */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}/>
      <GrammarModal isOpen={isGrammarModalOpen} onClose={() => setIsGrammarModalOpen(false)} />
      <FlashcardModal isOpen={isFlashcardOpen} onClose={() => setIsFlashcardOpen(false)} bundle={activeBundleForFlashcard}/>

      <ConfirmationModal 
        isOpen={isLogoutWarningOpen}
        onClose={() => setIsLogoutWarningOpen(false)}
        onConfirm={confirmGuestLogout}
        title="End Guest Session?"
        message="You are in a temporary Guest Session. Ending this session will permanently delete all your words and bundles. To keep them, click 'Save Progress' in the header instead."
        confirmText="End Session"
      />

      <ConfirmationModal 
        isOpen={isDeleteBundleModalOpen}
        onClose={() => setIsDeleteBundleModalOpen(false)}
        onConfirm={handleConfirmDeleteBundle}
        title="Delete Bundle?"
        message="Are you sure you want to delete this study bundle? This action cannot be undone."
        confirmText="Yes, Delete Bundle"
      />
    </div>
  );
};

export default Dashboard;