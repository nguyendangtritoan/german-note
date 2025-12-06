import { useState, useEffect } from 'react';
import { 
  signInAnonymously, 
  signInWithPopup, 
  linkWithPopup, // New import for account upgrading
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc,
  deleteDoc,
  collection, 
  onSnapshot, 
  query,
  arrayUnion, 
  serverTimestamp
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { useSettings } from '../context/SettingsContext';
import { useBundle } from '../context/BundleContext';
import { callGeminiApi } from '../api/gemini';
import { useLocalStorage } from './useLocalStorage';

export const useAppLogic = () => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { activeBundleId, setActiveBundleId } = useBundle();
  
  const [localSessionCache, setLocalSessionCache] = useLocalStorage('session_cache', []);
  const [currentSessionWords, setCurrentSessionWords] = useState(localSessionCache);
  
  const [pastBundles, setPastBundles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [requestQueue, setRequestQueue] = useState([]); 
  const { targetLanguages } = useSettings();

  // Search Logic
  const handleSearch = async (wordInput, forcedUser = null) => {
    const activeUser = forcedUser || user;
    const word = wordInput.trim();
    if (!word) return;

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
        const otherWords = currentSessionWords.filter(w => w.original.toLowerCase() !== normalizedKey);
        const newWords = [{ ...existing, timestamp: Date.now() }, ...otherWords];
        setCurrentSessionWords(newWords);
        setLocalSessionCache(newWords);
        if (activeUser) {
           const appId = 'default-german-app';
           await setDoc(doc(db, 'artifacts', appId, 'users', activeUser.uid, 'session', 'current'), { words: newWords }, { merge: true });
        }
        setIsLoading(false);
        return; 
      }

      // 2. Global Cache Check
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
        const newWords = [data, ...currentSessionWords];
        setCurrentSessionWords(newWords); 
        setLocalSessionCache(newWords);   

        if (activeUser) {
          const appId = 'default-german-app';
          await setDoc(doc(db, 'artifacts', appId, 'users', activeUser.uid, 'session', 'current'), { words: newWords }, { merge: true });

          if (!fromCache) {
            const globalPayload = { ...data, generated_at: Date.now() };
            delete globalPayload.id; 
            delete globalPayload.timestamp; 
            setDoc(doc(db, 'global_dictionary', normalizedKey), globalPayload).catch(console.error);
          }
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
      if (u && requestQueue.length > 0) {
        requestQueue.forEach(word => handleSearch(word, u));
        setRequestQueue([]);
      }
    });
    return () => unsubscribe();
  }, [requestQueue]);

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

  // Summarize / Save Logic
  const handleSummarize = async () => {
    if (!currentSessionWords.length || !user) return false;
    
    const appId = 'default-german-app';
    let targetId;
    let isNewBundle = false;

    if (activeBundleId) {
      targetId = activeBundleId; 
    } else {
      const now = new Date();
      targetId = now.toISOString(); 
      isNewBundle = true;
    }

    const bundleRef = doc(db, 'artifacts', appId, 'users', user.uid, 'bundles', targetId);

    try {
      const existingBundle = pastBundles.find(b => b.id === targetId);
      const existingWords = existingBundle ? existingBundle.words : [];
      const existingSet = new Set(existingWords.map(w => w.original.toLowerCase()));
      const uniqueNewWords = currentSessionWords.filter(w => !existingSet.has(w.original.toLowerCase()));

      if (!isNewBundle && uniqueNewWords.length === 0) {
        await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'session', 'current'), { words: [] });
        setCurrentSessionWords([]);
        setLocalSessionCache([]);
        return true; 
      }

      const mergedWords = [...uniqueNewWords, ...existingWords];

      await setDoc(bundleRef, {
        date: targetId, 
        lastUpdated: serverTimestamp(),
        words: mergedWords, 
        wordCount: mergedWords.length
      }, { merge: true });

      if (isNewBundle) {
        setActiveBundleId(targetId);
      }

      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'session', 'current'), { words: [] });
      setCurrentSessionWords([]);
      setLocalSessionCache([]);
      return true;
    } catch (e) { 
      console.error("Summarize Error:", e);
      return false;
    }
  };

  const handleDeleteBundle = async (bundleId) => {
    if (!user || !bundleId) return;
    const appId = 'default-german-app';
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'bundles', bundleId));
      if (activeBundleId === bundleId) {
        setActiveBundleId(null);
      }
      return true;
    } catch (e) {
      console.error("Delete Error:", e);
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

  // ULTRA THINK: Convert Guest to Permanent User
  // Uses linkWithPopup to preserve the current UID and Database Data
  const handleLinkGoogleAccount = async () => {
    if (!auth.currentUser) return;
    try {
      await linkWithPopup(auth.currentUser, googleProvider);
      console.log("Account successfully upgraded!");
    } catch (error) {
      console.error("Account Link Error:", error);
      if (error.code === 'auth/credential-already-in-use') {
        alert("This Google account is already used by another user. Please use a different one.");
      }
    }
  };

  return {
    user,
    authLoading,
    currentSessionWords,
    pastBundles,
    isLoading: isLoading || (authLoading && requestQueue.length > 0),
    handleSearch,
    handleSummarize,
    handleDeleteBundle,
    handleGoogleLogin,
    handleGuestLogin,
    handleLinkGoogleAccount // Exported
  };
};