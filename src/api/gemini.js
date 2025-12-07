import { GEMINI_API_URL } from '../utils/constants';
import { buildSystemPrompt } from '../utils/promptUtils';

export const callGeminiApi = async (word, languages, grammarTopic = null) => {
  // Mock logic handled by Adapter usually, but kept here if called directly
  if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
     // ... (handled in adapter usually)
  }

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return { error: "Gemini API Key is missing in .env file" };

  const systemPrompt = buildSystemPrompt(word, languages, grammarTopic);

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
          // Removed verbForms property
          translationsList: { 
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                code: { type: "STRING" },
                text: { type: "STRING" }
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
    
    const translationsObj = {};
    if (rawData.translationsList && Array.isArray(rawData.translationsList)) {
      rawData.translationsList.forEach(item => {
        if (item.code && item.text) translationsObj[item.code] = item.text;
      });
    }

    return { ...rawData, translations: translationsObj };
  } catch (error) {
    console.error("API Error", error);
    if (error.name === 'AbortError') return { error: "Request timed out." };
    return { error: "Failed to analyze word." };
  }
};