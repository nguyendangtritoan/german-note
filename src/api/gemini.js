import { GEMINI_API_URL } from '../utils/constants';

export const callGeminiApi = async (word, languages) => {
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
      translations: translationsObj,
      // Note: ID and timestamp are assigned later now to distinguish cache vs fresh
    };
    delete data.translationsList;

    return data;
  } catch (error) {
    console.error("API Error", error);
    if (error.name === 'AbortError') return { error: "Request timed out. Please try again." };
    return { error: "Failed to analyze word." };
  }
};