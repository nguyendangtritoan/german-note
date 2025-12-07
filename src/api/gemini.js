import { GEMINI_API_URL } from '../utils/constants';

// --- MOCK DATA GENERATOR ---
const getMockData = (word, grammarTopic) => ({
  original: word,
  type: "noun (mock)",
  article: "das",
  verbForms: {
    present_3rd: "mockt",
    past_3rd: "mockte",
    perfect_3rd: "hat gemockt",
    konjunktiv2_3rd: "möckte"
  },
  translations: {
    en: `[Mock] Translation of ${word}`,
    vi: `[Mock] Bản dịch của ${word}`,
    es: `[Mock] Traducción de ${word}`,
    fr: `[Mock] Traduction de ${word}`,
    ja: `[Mock] ${word} の翻訳`,
    ko: `[Mock] ${word} 번역`
  },
  example: grammarTopic 
    ? `[Mock] Satz mit **${grammarTopic}**: Der ${word} wurde getestet.` 
    : `Das ist ein einfacher Mocksatz für das Wort "${word}".`,
});

export const callGeminiApi = async (word, languages, grammarTopic = null) => {
  // 1. CHECK FOR MOCK MODE
  if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
    console.log(`🎭 [Mock Mode] Returning fake data for: "${word}" (Topic: ${grammarTopic})`);
    await new Promise(resolve => setTimeout(resolve, 800));
    return getMockData(word, grammarTopic);
  }

  // 2. REAL API CALL
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return { error: "API Key is missing in .env file" };

  const langInstruction = languages.map(l => `"${l.code}"`).join(', ');

  // UPDATED INSTRUCTION (Level Agnostic)
  // If grammar is chosen -> Use appropriate CEFR level for that grammar.
  // If no grammar -> Default to simple A2.
  const grammarInstruction = grammarTopic 
    ? `6. CONSTRAINT: The example sentence must strictly use the grammar structure: "${grammarTopic}". IMPORTANT: Adjust the sentence complexity and vocabulary to match the CEFR level typically associated with "${grammarTopic}" (e.g. if it is a B2 topic, use B2 vocabulary). If "${word}" is a noun, make it the focus. Wrap the specific grammatical structure (verbs/endings) in **double asterisks**.`
    : `6. Provide one simple A2-level German example sentence.`;

  const systemPrompt = `You are an expert German linguist. Analyze the German word "${word}" and output JSON.

1. Identify type (Noun, Verb, Adjective, etc).
2. If Noun, provide article (der, die, das). Else null.
3. If Verb, provide 3rd person singular conjugations: Present, Präteritum (Past), Perfekt, Konjunktiv II.
4. Translate to: ${langInstruction}.
5. Match "original" to input.
${grammarInstruction}

Output must follow this JSON schema exactly.`;

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
    };
    delete data.translationsList;

    return data;
  } catch (error) {
    console.error("API Error", error);
    if (error.name === 'AbortError') return { error: "Request timed out. Please try again." };
    return { error: "Failed to analyze word." };
  }
};