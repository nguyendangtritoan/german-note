import { useState, useEffect } from 'react';
import { 
  doc, setDoc, getDoc, deleteDoc, collection, 
  onSnapshot, query, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { useLocalStorage } from './useLocalStorage';

export const useFirestore = (user, activeBundleId, setActiveBundleId) => {
  const [localSessionCache, setLocalSessionCache] = useLocalStorage('session_cache', []);
  const [currentSessionWords, setCurrentSessionWords] = useState(localSessionCache);
  const [pastBundles, setPastBundles] = useState([]);

  // Sync Session Logic
  const syncSession = async (newWords) => {
    setCurrentSessionWords(newWords);
    setLocalSessionCache(newWords);

    if (user) {
      try {
        const appId = 'default-german-app';
        // If viewing a bundle, update the bundle
        if (activeBundleId) {
          const bundleRef = doc(db, 'artifacts', appId, 'users', user.uid, 'bundles', activeBundleId);
          await setDoc(bundleRef, { words: newWords, wordCount: newWords.length }, { merge: true });
        } else {
          // Otherwise update live session
          const sessionRef = doc(db, 'artifacts', appId, 'users', user.uid, 'session', 'current');
          await setDoc(sessionRef, { words: newWords }, { merge: true });
        }
      } catch (error) {
        console.error("Sync Error:", error);
      }
    }
  };

  // Listener: Current Session
  useEffect(() => {
    if (!user) return;
    const appId = 'default-german-app';
    const sessionRef = doc(db, 'artifacts', appId, 'users', user.uid, 'session', 'current');
    
    // Only listen if we are NOT in a bundle view
    if (!activeBundleId) {
      const unsub = onSnapshot(sessionRef, (s) => {
        if (s.exists()) {
          const words = s.data().words || [];
          setCurrentSessionWords(words);
          setLocalSessionCache(words); 
        }
      });
      return () => unsub();
    } else {
      // If we ARE in a bundle view, load that bundle's words
      const bundle = pastBundles.find(b => b.id === activeBundleId);
      if (bundle) {
        setCurrentSessionWords(bundle.words || []);
      }
    }
  }, [user, activeBundleId, pastBundles]); // re-run if active bundle changes

  // Listener: Past Bundles
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

  // Actions
  const handleDeleteWord = async (wordId) => {
    const newWords = currentSessionWords.filter(w => w.id !== wordId);
    await syncSession(newWords);
  };

  const handleDeleteWordFromBundle = async (bundleId, wordId) => {
    // This is technically redundant if activeBundleId is set correctly, but kept for specific bundle targeting
    if (!user || !bundleId) return;
    const appId = 'default-german-app';
    const bundleRef = doc(db, 'artifacts', appId, 'users', user.uid, 'bundles', bundleId);
    try {
      const bundleSnap = await getDoc(bundleRef);
      if (bundleSnap.exists()) {
        const bundleData = bundleSnap.data();
        const updatedWords = (bundleData.words || []).filter(w => w.id !== wordId);
        await setDoc(bundleRef, { words: updatedWords, wordCount: updatedWords.length }, { merge: true });
      }
    } catch (e) { console.error(e); }
  };

  const handleDeleteBundle = async (bundleId) => {
    if (!user || !bundleId) return;
    const appId = 'default-german-app';
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'bundles', bundleId));
      if (activeBundleId === bundleId) setActiveBundleId(null);
    } catch (e) { console.error(e); }
  };

  const handleSummarize = async () => {
    if (!currentSessionWords.length || !user) return false;
    const appId = 'default-german-app';
    let targetId = activeBundleId || new Date().toISOString();
    let isNewBundle = !activeBundleId;

    const bundleRef = doc(db, 'artifacts', appId, 'users', user.uid, 'bundles', targetId);

    try {
      const existingBundle = pastBundles.find(b => b.id === targetId);
      const existingWords = existingBundle ? existingBundle.words : [];
      
      // Simple de-dupe based on original text
      const existingSignatures = new Set(existingWords.map(w => `${w.original.toLowerCase()}|${w.grammarTopic || ''}`));
      const uniqueNewWords = currentSessionWords.filter(w => !existingSignatures.has(`${w.original.toLowerCase()}|${w.grammarTopic || ''}`));

      if (!isNewBundle && uniqueNewWords.length === 0) {
        // Just clear session
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

      if (isNewBundle) setActiveBundleId(targetId);

      // Clear Live Session
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'session', 'current'), { words: [] });
      setCurrentSessionWords([]);
      setLocalSessionCache([]);
      return true;
    } catch (e) { 
      console.error("Summarize Error:", e);
      return false;
    }
  };

  return {
    currentSessionWords,
    pastBundles,
    syncSession, // Exposed for useAI
    handleDeleteWord,
    handleDeleteWordFromBundle,
    handleDeleteBundle,
    handleSummarize
  };
};