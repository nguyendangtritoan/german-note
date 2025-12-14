import { callGeminiApi } from './gemini';
import { callGroqApi } from './groq';
import { getMockData } from './mock';
import { buildRegeneratePrompt } from '../utils/regeneratePrompt'; // Import new builder

// Standard Analysis
export const generateWordAnalysis = async (word, languages, grammarTopic = null, options = {}) => {
  if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
    await new Promise(resolve => setTimeout(resolve, 600)); 
    return { 
      ...getMockData(word, grammarTopic), 
      id: crypto.randomUUID(), 
      timestamp: Date.now(),
      grammarTopic 
    };
  }

  const provider = import.meta.env.VITE_AI_PROVIDER || 'gemini';
  let data;

  if (provider === 'groq') {
    data = await callGroqApi(word, languages, grammarTopic, options);
  } else {
    data = await callGeminiApi(word, languages, grammarTopic, options);
  }

  if (data && !data.error) {
    return {
      ...data,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      grammarTopic
    };
  }
  return data;
};

// NEW: Regeneration Logic
export const regenerateExample = async (word, grammarTopic = null) => {
  if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
    return { example: `[Regenerated] Example for ${word}` };
  }

  const provider = import.meta.env.VITE_AI_PROVIDER || 'gemini';
  let data;

  console.log(`♻️ Regenerating Example via ${provider}...`);

  // Pass 'buildRegeneratePrompt' as the promptBuilder argument
  if (provider === 'groq') {
    data = await callGroqApi(word, [], grammarTopic, {}, buildRegeneratePrompt);
  } else {
    data = await callGeminiApi(word, [], grammarTopic, {}, buildRegeneratePrompt);
  }

  return data;
};