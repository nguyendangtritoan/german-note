import { GEMINI_API_URL } from '../utils/constants';
import { buildSystemPrompt } from '../utils/promptUtils';

// Added 'promptBuilder' parameter
export const callGeminiApi = async (word, languages, grammarTopic = null, options = {}, promptBuilder = null) => {
  if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
     // Mock logic fallback would go here
  }

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return { error: "Gemini API Key is missing in .env file" };

  // Use custom builder if provided, else default
  const systemPrompt = promptBuilder 
    ? promptBuilder(word, grammarTopic) 
    : buildSystemPrompt(word, languages, grammarTopic, options);

  const payload = {
    contents: [{ parts: [{ text: `Analyze: "${word}"` }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      responseMimeType: "application/json"
      // We rely on the prompt to enforce schema for flexibility
    }
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(GEMINI_API_URL + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId); 

    if (!response.ok) {
       const errText = await response.text();
       return { error: `API Error: ${response.status}` };
    }

    const result = await response.json();
    const rawData = JSON.parse(result.candidates?.[0]?.content?.parts?.[0]?.text || "{}");
    
    // If it's the full analysis, process translations. If just example, return as is.
    if (rawData.translationsList) {
       const translationsObj = {};
       if (Array.isArray(rawData.translationsList)) {
         rawData.translationsList.forEach(item => {
           if (item.code && item.text) translationsObj[item.code] = item.text;
         });
       }
       const { translationsList, ...cleanData } = rawData;
       return { ...cleanData, translations: translationsObj };
    }

    return rawData; // Returns { example: "..." } for regeneration
  } catch (error) {
    console.error("API Error", error);
    return { error: "Failed to analyze word." };
  }
};