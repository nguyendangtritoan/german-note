// Chosen Palette: Calm Harmony (Beige, Slate, Indigo, White)
// Fixes: 
// 1. Updated API URL to 'gemini-2.5-flash-preview-09-2025' per user request.
// 2. MOVED 'setIsLoading(false)' to execute BEFORE database write. This prevents the "stuck spinner" issue when the UI has already updated but the DB server ACK is pending.
// 3. Added 15-second timeout to fetch request to handle network hangs gracefully.

import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { 
  signInAnonymously, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  collection, 
  addDoc, 
  onSnapshot, 
  query
} from 'firebase/firestore';
// Import initialized instances
import { auth, db, googleProvider } from './firebase'; 

import {
  LayoutDashboard,
  Settings,
  Book,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  Printer,
  X,
  Layers,
  Sparkles,
  LogOut,
  User,
  BookOpen,
  AlertTriangle
} from 'lucide-react';

// --- ICONS MAPPING ---
const ICONS = {
  LayoutDashboard, Settings, Book, ArrowRight, Loader2, Eye, EyeOff, 
  Printer, X, Layers, Sparkles, LogOut, User, BookOpen, AlertTriangle
};

const Icon = ({ name, className = "w-5 h-5" }) => {
  const LucideIcon = ICONS[name];
  return LucideIcon ? <LucideIcon className={className} /> : null;
};

// --- CONFIGURATION ---
// UPDATED: Using the Gemini 2.5 Preview model as requested
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=`;

// --- CUSTOM HOOKS ---

// 1. Local Storage Hook
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };
  return [storedValue, setValue];
};

// 2. Settings Context
const SettingsContext = createContext();

const SettingsProvider = ({ children }) => {
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

const useSettings = () => useContext(SettingsContext);

// 3. Main Application Logic Hook (Separated from View)
const useAppLogic = () => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentSessionWords, setCurrentSessionWords] = useState([]);
  const [pastBundles, setPastBundles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { targetLanguages } = useSettings();

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
      if (!u) {
        setCurrentSessionWords([]);
        setPastBundles([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync Current Session
  useEffect(() => {
    if (!user) return;
    const appId = 'default-german-app';
    const sessionRef = doc(db, 'artifacts', appId, 'users', user.uid, 'session', 'current');
    const unsub = onSnapshot(sessionRef, (s) => setCurrentSessionWords(s.exists() ? s.data().words : []));
    return () => unsub();
  }, [user]);

  // Sync Bundles
  useEffect(() => {
    if (!user) return;
    const appId = 'default-german-app';
    const bundlesRef = collection(db, 'artifacts', appId, 'users', user.uid, 'bundles');
    const q = query(bundlesRef);
    const unsub = onSnapshot(q, (s) => {
      setPastBundles(s.docs.map(d => ({id: d.id, ...d.data()})).sort((a,b) => new Date(b.date) - new Date(a.date)));
    });
    return () => unsub();
  }, [user]);

  const handleSearch = async (word) => {
    setIsLoading(true);
    try {
      const existing = currentSessionWords.find(w => w.original.toLowerCase() === word.toLowerCase());
      if (existing) {
        // Word already exists, stop loading and return
        setIsLoading(false);
        return; 
      }
      
      const data = await callGeminiApi(word, targetLanguages);
      
      // CRITICAL FIX: Stop loading state HERE, immediately after we get the data.
      // Do not wait for setDoc to resolve, as network latency can cause the spinner to hang 
      // even though the UI has already updated via optimistic listeners.
      setIsLoading(false);

      if (!data.error) {
        const newWords = [data, ...currentSessionWords];
        const appId = 'default-german-app';
        await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'session', 'current'), { words: newWords }, { merge: true });
      } else {
        console.error("Gemini API Error:", data.error);
        // Optionally handle error state specifically here if needed
      }
    } catch (error) {
      console.error("Unexpected error in handleSearch:", error);
      setIsLoading(false); // Ensure loading stops on error
    }
  };

  const handleSummarize = async () => {
    if (!currentSessionWords.length) return false;
    const today = new Date().toISOString().split('T')[0];
    const newBundle = { date: today, wordCount: currentSessionWords.length, words: currentSessionWords };
    const appId = 'default-german-app';
    try {
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'bundles'), newBundle);
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'session', 'current'), { words: [] });
      return true;
    } catch (e) { 
      console.error("Summarize Error:", e);
      return false;
    }
  };

  const handleGoogleLogin = async () => {
    try { await signInWithPopup(auth, googleProvider); } 
    catch (e) { console.error("Google Auth Error:", e); }
  };

  const handleGuestLogin = async () => {
    try { await signInAnonymously(auth); } 
    catch (e) { console.error("Guest Auth Error:", e); }
  };

  return {
    user,
    authLoading,
    currentSessionWords,
    pastBundles,
    isLoading,
    handleSearch,
    handleSummarize,
    handleGoogleLogin,
    handleGuestLogin
  };
};

// --- UI COMPONENTS ---

const Button = React.forwardRef(({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
  const baseStyle = "inline-flex items-center justify-center font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-150";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
    secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-indigo-500",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-indigo-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    google: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-400"
  };
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2 text-base", lg: "px-6 py-3 text-lg", icon: "p-2" };
  return <button ref={ref} className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>{children}</button>;
});

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg m-4 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close modal"><Icon name="X" /></Button>
        </header>
        <main className="p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

// ... SettingsModal, WordCard, WordCardSkeleton components below are purely presentational ...

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

const WordCard = ({ wordData }) => {
  const { visibility } = useSettings();
  const { original, article, type, translations = {}, example, verbForms } = wordData;
  const [showVerbForms, setShowVerbForms] = useState(false);

  const renderArticle = () => {
    if (!article || article === 'null' || !visibility.article) return null;
    return <span className="font-bold text-indigo-600 transition-all duration-300">{article}</span>;
  };

  const isVerb = type?.toLowerCase().includes('verb');

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden transition-all hover:shadow-xl border border-slate-100">
      <div className="p-5">
        <header className="flex justify-between items-start mb-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-slate-100 text-slate-500 border border-slate-200">{type || 'Word'}</span>
            </div>
            <h3 className="text-3xl font-bold text-slate-800">
              {renderArticle() && <>{renderArticle()} </>}{original}
            </h3>
          </div>
          {isVerb && verbForms && (
            <Button variant="secondary" size="sm" onClick={() => setShowVerbForms(!showVerbForms)} className="text-xs">
              <Icon name="Layers" className="w-4 h-4 mr-1" />{showVerbForms ? 'Hide Forms' : 'Forms'}
            </Button>
          )}
        </header>
        {isVerb && showVerbForms && verbForms && (
          <div className="mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100 text-sm animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div><span className="text-xs font-bold text-indigo-400 uppercase block">Present (3rd)</span><span className="text-slate-700 font-medium">{verbForms.present_3rd || '-'}</span></div>
              <div><span className="text-xs font-bold text-indigo-400 uppercase block">Präteritum</span><span className="text-slate-700 font-medium">{verbForms.past_3rd || '-'}</span></div>
              <div><span className="text-xs font-bold text-indigo-400 uppercase block">Perfekt</span><span className="text-slate-700 font-medium">{verbForms.perfect_3rd || '-'}</span></div>
              <div><span className="text-xs font-bold text-indigo-400 uppercase block">Konjunktiv II</span><span className="text-slate-700 font-medium">{verbForms.konjunktiv2_3rd || '-'}</span></div>
            </div>
          </div>
        )}
        <div className="space-y-3 mb-4">
          {translations && Object.entries(translations).map(([lang, text]) => (
            <div key={lang} className="flex items-center">
              <span className="text-xs uppercase font-bold text-slate-400 w-8">{lang}</span>
              <span className="text-lg text-slate-700">{text}</span>
            </div>
          ))}
        </div>
        {example && (
          <div className="transition-all duration-300">
            <p className={`p-3 bg-slate-50 rounded-lg italic text-slate-600 ${visibility.example ? 'opacity-100' : 'opacity-0 h-0 p-0 m-0 overflow-hidden'}`}>
              {example}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const WordCardSkeleton = () => (
  <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-slate-100 animate-pulse">
    <div className="p-5">
      <div className="flex justify-between items-start mb-3">
        <div className="h-8 bg-slate-200 rounded w-1/2"></div>
      </div>
      <div className="space-y-3 mb-4">
        <div className="h-6 bg-slate-200 rounded w-1/3"></div>
      </div>
      <div className="h-12 bg-slate-100 rounded-lg"></div>
    </div>
  </div>
);

// --- API HELPER ---
const callGeminiApi = async (word, languages) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return { error: "API Key is missing in .env file" };

  const langNames = languages.map(l => l.name).join(', ');
  const systemPrompt = `You are an expert German linguist. Analyze a German word and output JSON.
1. Identify type (Noun, Verb, Adjective, etc).
2. If Noun, provide article (der, die, das). Else null.
3. If Verb, provide 3rd person singular conjugations: Present, Präteritum (Past), Perfekt, Konjunktiv II.
4. Translate to: ${langNames}.
5. Provide one simple A2-level German example sentence.
6. Ensure original word matches input exactly.`;

  const payload = {
    contents: [{ parts: [{ text: `Analyze this word: "${word}"` }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          original: { type: "STRING" },
          type: { type: "STRING" },
          article: { type: "STRING" },
          verbForms: {
            type: "OBJECT",
            properties: {
              present_3rd: { type: "STRING" },
              past_3rd: { type: "STRING" },
              perfect_3rd: { type: "STRING" },
              konjunktiv2_3rd: { type: "STRING" }
            },
            nullable: true
          },
          translationsList: { 
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                code: { type: "STRING", description: "Language code (e.g. 'en', 'vi')" },
                text: { type: "STRING", description: "The translated word" }
              },
              required: ["code", "text"]
            }
          },
          example: { type: "STRING" }
        },
        required: ["original", "type", "article", "translationsList", "example"]
      }
    }
  };

  try {
    // FIX: Add AbortController for 15s Timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(GEMINI_API_URL + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId); // Clear timeout on success

    if (!response.ok) {
       const errText = await response.text();
       console.error("Gemini API Error Detail:", errText);
       return { error: `API Error: ${response.status}` };
    }

    const result = await response.json();
    const rawData = JSON.parse(result.candidates?.[0]?.content?.parts?.[0]?.text || "{}");
    
    const translationsObj = {};
    if (rawData.translationsList && Array.isArray(rawData.translationsList)) {
      rawData.translationsList.forEach(item => {
        if (item.code && item.text) translationsObj[item.code] = item.text;
      });
    }

    const data = {
      ...rawData,
      translations: translationsObj
    };
    delete data.translationsList;

    return { id: crypto.randomUUID(), ...data, timestamp: Date.now() };
  } catch (error) {
    console.error("API Error", error);
    if (error.name === 'AbortError') return { error: "Request timed out. Please try again." };
    return { error: "Failed to analyze word." };
  }
};

// --- SUB-VIEWS ---

const InputHero = ({ onSearch, isLoading }) => {
  const [word, setWord] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (word.trim() && !isLoading) { onSearch(word.trim()); setWord(""); }
  };
  return (
    <form onSubmit={handleSubmit} className="relative">
      <input type="text" value={word} onChange={(e) => setWord(e.target.value)} placeholder="Type a German word..." className="w-full pl-6 pr-20 py-5 text-lg border-2 border-slate-200 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400" disabled={isLoading} />
      <Button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2" disabled={isLoading}>
        {isLoading ? <Icon name="Loader2" className="animate-spin" /> : <Icon name="ArrowRight" />}
      </Button>
    </form>
  );
};

const LiveFeed = ({ words, isLoading, onSummarize }) => {
  const hasWords = words.length > 0;
  return (
    <div className="space-y-4">
      {hasWords && (
        <div className="flex justify-end">
          <Button variant="primary" onClick={onSummarize} className="bg-indigo-500 hover:bg-indigo-600">
            <Icon name="Sparkles" className="mr-2" />Summarize Today ({words.length})
          </Button>
        </div>
      )}
      <div className="space-y-4">
        {isLoading && <WordCardSkeleton />}
        {words.map(word => <WordCard key={word.id} wordData={word} />)}
        {!isLoading && !hasWords && (
          <div className="text-center py-10 px-6 bg-white rounded-xl shadow-md border border-slate-100">
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Welcome!</h3>
            <p className="text-slate-500">Type a word above to start your German lesson.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const BundleManager = ({ bundles, onSelectBundle }) => {
  if (bundles.length === 0) return <div className="text-center py-10 px-6 bg-white rounded-xl shadow-md"><h3 className="text-xl font-semibold mb-2">No Bundles Yet</h3></div>;
  return (
    <div className="space-y-4">
      {bundles.map(bundle => (
        <button key={bundle.id} onClick={() => onSelectBundle(bundle)} className="w-full text-left p-5 bg-white shadow-lg rounded-xl flex justify-between items-center hover:scale-[1.02] transition-transform">
          <div>
            <h3 className="text-xl font-semibold text-slate-800">{new Date(bundle.date).toLocaleDateString()}</h3>
            <p className="text-slate-500">{bundle.wordCount} words</p>
          </div>
          <Icon name="ArrowRight" className="text-indigo-500" />
        </button>
      ))}
    </div>
  );
};

const FlashcardModal = ({ isOpen, onClose, bundle }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  useEffect(() => { if (isOpen) { setCurrentIndex(0); setIsFlipped(false); } }, [isOpen]);

  if (!bundle?.words?.length) return null;
  const words = bundle.words;
  const currentWord = words[currentIndex];
  const hasValidArticle = currentWord.article && currentWord.article !== 'null';

  const nextCard = () => { setIsFlipped(false); setCurrentIndex(prev => (prev + 1) % words.length); };
  const prevCard = () => { setIsFlipped(false); setCurrentIndex(prev => (prev - 1 + words.length) % words.length); };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Study: ${new Date(bundle.date).toLocaleDateString()}`}>
      <div className="flex flex-col">
        <div className="w-full h-80 rounded-xl bg-slate-50 border-2 border-slate-200 cursor-pointer flex items-center justify-center" onClick={() => setIsFlipped(!isFlipped)} style={{ perspective: '1000px' }}>
          <div className="w-full h-full relative" style={{ transformStyle: 'preserve-3d', transition: 'transform 0.6s' }}>
            <div className="absolute w-full h-full flex items-center justify-center" style={{ backfaceVisibility: 'hidden', transform: `rotateY(${isFlipped ? 180 : 0}deg)` }}>
              <div className="p-6 flex flex-col items-center">
                <span className="mb-4 px-2 py-0.5 rounded text-xs uppercase font-bold bg-slate-100 text-slate-400">{currentWord.type}</span>
                <h2 className="text-4xl font-bold text-slate-800 text-center">
                  {hasValidArticle && <span className="text-indigo-600 mr-2">{currentWord.article}</span>}
                  {currentWord.original}
                </h2>
              </div>
            </div>
            <div className="absolute w-full h-full" style={{ backfaceVisibility: 'hidden', transform: `rotateY(${isFlipped ? 0 : -180}deg)` }}>
              <div className="p-6 flex flex-col justify-center h-full text-center space-y-4">
                {currentWord.translations && Object.entries(currentWord.translations).map(([lang, text]) => (
                  <div key={lang}><span className="text-xs font-bold text-slate-400 uppercase mr-2">{lang}</span><span className="text-xl text-slate-700 font-medium">{text}</span></div>
                ))}
                <p className="italic text-slate-600 p-2 bg-slate-100 rounded">"{currentWord.example}"</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <Button variant="secondary" onClick={prevCard}>Previous</Button>
          <span className="text-slate-500 font-medium">{currentIndex + 1} / {words.length}</span>
          <Button variant="secondary" onClick={nextCard}>Next</Button>
        </div>
      </div>
    </Modal>
  );
};

const LoginScreen = ({ onGoogleLogin, onGuestLogin }) => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-8 text-center space-y-8">
      <div>
        <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Icon name="BookOpen" className="w-8 h-8 text-indigo-600" /></div>
        <h1 className="text-2xl font-bold text-slate-800">German Class Companion</h1>
        <p className="text-slate-500 mt-2">Your smart assistant for the classroom.</p>
      </div>
      <div className="space-y-4">
        <Button variant="google" size="lg" className="w-full flex items-center justify-center" onClick={onGoogleLogin}>
          Sign in with Google
        </Button>
        <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-500">Or continue as</span></div></div>
        <Button variant="ghost" size="lg" className="w-full" onClick={onGuestLogin}>Guest (Anonymous)</Button>
      </div>
    </div>
  </div>
);

// --- MAIN DASHBOARD VIEW ---
const Dashboard = ({ logic }) => {
  const [currentView, setCurrentView] = useState('live');
  const [activeBundle, setActiveBundle] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFlashcardOpen, setIsFlashcardOpen] = useState(false);

  // Unpack logic
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

// --- ENTRY POINT ---
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

export default function Main() { return <SettingsProvider><App /></SettingsProvider>; }