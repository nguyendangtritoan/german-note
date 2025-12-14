import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { generateWordAnalysis, regenerateExample } from '../api';

export const useAI = (user, authLoading, currentSessionWords, syncSession, settings) => {
  const [isLoading, setIsLoading] = useState(false);
  const [requestQueue, setRequestQueue] = useState([]);

  // Process Queue on Login
  useEffect(() => {
    if (user && !authLoading && requestQueue.length > 0) {
      requestQueue.forEach(word => handleSearch(word));
      setRequestQueue([]);
    }
  }, [user, authLoading, requestQueue]);

  const handleSearch = async (wordInput) => {
    const word = wordInput.trim();
    if (!word) return;

    if (!user && authLoading) {
      setRequestQueue(prev => [...prev, word]);
      return;
    }

    setIsLoading(true);
    const normalizedKey = word.toLowerCase();

    try {
      // 1. Local Duplicate Check
      const existing = currentSessionWords.find(w => 
        w.original.toLowerCase() === normalizedKey && 
        w.grammarTopic === settings.selectedGrammar
      );

      if (existing) {
        console.log("Exact Match Found. Moving to top.");
        const otherWords = currentSessionWords.filter(w => w.id !== existing.id);
        const newWords = [{ ...existing, timestamp: Date.now() }, ...otherWords];
        await syncSession(newWords);
        setIsLoading(false);
        return;
      }

      // 2. Global Cache Check
      let data = null;
      let fromCache = false;

      if (!settings.selectedGrammar) {
        try {
          const globalDocRef = doc(db, 'global_dictionary', normalizedKey);
          const globalSnap = await getDoc(globalDocRef);
          if (globalSnap.exists()) {
            data = { ...globalSnap.data(), id: crypto.randomUUID(), timestamp: Date.now() };
            fromCache = true;
          }
        } catch (e) { console.warn("Cache skipped", e); }
      }

      // 3. AI API Call
      if (!data) {
        const analysisOptions = {
          includePlural: settings.visibility.plural,
          includeVerbForms: settings.visibility.verbForms
        };
        data = await generateWordAnalysis(word, settings.targetLanguages, settings.selectedGrammar, analysisOptions);
        console.log("🤖 AI Response JSON:\n", JSON.stringify(data, null, 2));
      }

      setIsLoading(false);

      if (data && !data.error) {
        const newWords = [data, ...currentSessionWords];
        await syncSession(newWords);

        // Save to Global Cache
        if (user && !fromCache && !settings.selectedGrammar) {
          const globalPayload = { ...data, generated_at: Date.now() };
          delete globalPayload.id; 
          delete globalPayload.timestamp; 
          setDoc(doc(db, 'global_dictionary', normalizedKey), globalPayload).catch(console.error);
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      setIsLoading(false);
    }
  };

  const handleRegenerateWord = async (wordId) => {
    const wordToFix = currentSessionWords.find(w => w.id === wordId);
    if (!wordToFix) return;

    console.log("🔄 Requesting new example for:", wordToFix.original);
    
    // Call separate logic for strictly grammar-focused example regeneration
    const newData = await regenerateExample(wordToFix.original, wordToFix.grammarTopic);

    if (newData && newData.example) {
      console.log("✅ New Example Received:", newData.example);
      
      const updatedWord = { ...wordToFix, example: newData.example };
      const updatedList = currentSessionWords.map(w => w.id === wordId ? updatedWord : w);
      
      await syncSession(updatedList);
    }
  };

  return { isLoading, handleSearch, handleRegenerateWord };
};