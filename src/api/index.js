import { callGeminiApi } from './gemini';
import { callGroqApi } from './groq';
import { getMockData } from './mock';

export const generateWordAnalysis = async (word, languages, grammarTopic = null) => {
  // 1. Mock Mode Check (Global)
  if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
    console.log(`🎭 [Adapter] Using Mock Data for: "${word}"`);
    await new Promise(resolve => setTimeout(resolve, 600)); 
    return { 
      ...getMockData(word, grammarTopic), 
      id: crypto.randomUUID(), 
      timestamp: Date.now(),
      grammarTopic // Store topic in mock data too
    };
  }

  // 2. Provider Routing
  const provider = import.meta.env.VITE_AI_PROVIDER || 'gemini';
  let data;

  console.log(`🤖 [Adapter] Calling AI Provider: ${provider.toUpperCase()}`);

  if (provider === 'groq') {
    data = await callGroqApi(word, languages, grammarTopic);
  } else {
    data = await callGeminiApi(word, languages, grammarTopic);
  }

  // 3. Common Post-Processing
  if (data && !data.error) {
    return {
      ...data,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      grammarTopic // CRITICAL: Save the topic with the word data
    };
  }

  return data;
};