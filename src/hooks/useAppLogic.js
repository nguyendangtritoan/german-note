import { useState, useEffect } from 'react';
import { 
  signInAnonymously, 
  signInWithPopup, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc,
  collection, 
  onSnapshot, 
  query,
  arrayUnion, 
  serverTimestamp
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { useSettings } from '../context/SettingsContext';
import { callGeminiApi } from '../api/gemini';
import { useLocalStorage } from './useLocalStorage';

export const useAppLogic = () => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Silent Boot: Init from localStorage immediately
  const [localSessionCache, setLocalSessionCache] = useLocalStorage('session_cache', []);
  const [currentSessionWords, setCurrentSessionWords] = useState(localSessionCache);
  
  const [pastBundles, setPastBundles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [requestQueue, setRequestQueue] = useState([]); 
  const { targetLanguages } = useSettings();

  // Search Logic defined before it's used
  const handleSearch = async (wordInput, forcedUser = null) => {
    const activeUser = forcedUser || user;
    const word = wordInput.trim();
    if (!word) return;

    // Queue logic: If no user and still loading auth, queue it
    if (!activeUser && authLoading) {
      setRequestQueue(prev => [...prev, word]);
      return; 
    }

    setIsLoading(true);
    const normalizedKey = word.toLowerCase();

    try {
      // 1. Local Session Check
      const existing = currentSessionWords.find(w => w.original.toLowerCase() === normalizedKey);
      if (existing) {
        setIsLoading(false);
        return; 
      }

      // 2. Global Hive Mind Check
      let data = null;
      let fromCache = false;

      try {
        const globalDocRef = doc(db, 'global_dictionary', normalizedKey);
        const globalSnap = await getDoc(globalDocRef);
        
        if (globalSnap.exists()) {
          data = { ...globalSnap.data(), id: crypto.randomUUID(), timestamp: Date.now() };
          fromCache = true;
        }
      } catch (cacheErr) {
        console.warn("Cache check skipped:", cacheErr);
      }

      // 3. AI Fallback
      if (!data) {
        data = await callGeminiApi(word, targetLanguages);
      }
      
      setIsLoading(false);

      if (data && !data.error) {
        // Optimistic Update
        const newWords = [data, ...currentSessionWords];
        setCurrentSessionWords(newWords); 
        setLocalSessionCache(newWords);   

        if (activeUser) {
          const appId = 'default-german-app';
          // Sync to User Session
          await setDoc(doc(db, 'artifacts', appId, 'users', activeUser.uid, 'session', 'current'), { words: newWords }, { merge: true });

          // Sync to Hive Mind (if fresh)
          if (!fromCache) {
            const globalPayload = { ...data, generated_at: Date.now() };
            delete globalPayload.id; 
            delete globalPayload.timestamp; 
            
            // Fire and forget write
            setDoc(doc(db, 'global_dictionary', normalizedKey), globalPayload).catch(console.error);
          }
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      setIsLoading(false);
    }
  };

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
      
      // Process Queue when auth resolves
      if (u && requestQueue.length > 0) {
        requestQueue.forEach(word => handleSearch(word, u));
        setRequestQueue([]);
      }
    });
    return () => unsubscribe();
  }, [requestQueue]); // Dependency on requestQueue ensures we catch updates

  // Sync Current Session from Firestore
  useEffect(() => {
    if (!user) return;
    const appId = 'default-german-app';
    const sessionRef = doc(db, 'artifacts', appId, 'users', user.uid, 'session', 'current');
    
    const unsub = onSnapshot(sessionRef, (s) => {
      if (s.exists()) {
        const words = s.data().words || [];
        setCurrentSessionWords(words);
        setLocalSessionCache(words); 
      }
    });
    return () => unsub();
  }, [user]);

  // Sync Past Bundles
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

  // Bundle Logic (Upsert)
  const handleSummarize = async () => {
    if (!currentSessionWords.length || !user) return false;
    
    const todayId = new Date().toISOString().split('T')[0]; 
    const appId = 'default-german-app';
    const bundleRef = doc(db, 'artifacts', appId, 'users', user.uid, 'bundles', todayId);

    try {
      // Calculate new word count based on existing bundle or 0
      const existingBundle = pastBundles.find(b => b.id === todayId);
      const currentCount = existingBundle ? existingBundle.wordCount : 0;

      await setDoc(bundleRef, {
        date: todayId,
        lastUpdated: serverTimestamp(),
        words: arrayUnion(...currentSessionWords), 
        wordCount: currentCount + currentSessionWords.length
      }, { merge: true });

      // Clear session after successful save
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'session', 'current'), { words: [] });
      setCurrentSessionWords([]);
      setLocalSessionCache([]);
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
    isLoading: isLoading || (authLoading && requestQueue.length > 0),
    handleSearch,
    handleSummarize,
    handleGoogleLogin,
    handleGuestLogin
  };
};