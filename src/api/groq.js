import { buildSystemPrompt, JSON_SCHEMA_STRING } from '../utils/promptUtils'; 

export const callGroqApi = async (word, languages, grammarTopic = null, options = {}, promptBuilder = null) => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) return { error: "Groq API Key is missing in .env file" };

  let systemPrompt;
  
  if (promptBuilder) {
    systemPrompt = promptBuilder(word, grammarTopic);
  } else {
    const basePrompt = buildSystemPrompt(word, languages, grammarTopic, options);
    systemPrompt = `${basePrompt}\n\nOutput strictly JSON matching this schema:\n${JSON_SCHEMA_STRING}`;
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Word: "${word}"` }
        ],
        model: "llama-3.3-70b-versatile", 
        response_format: { type: "json_object" } 
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return { error: `Groq API Error: ${response.status} - ${errText}` };
    }

    const json = await response.json();
    const rawData = JSON.parse(json.choices[0].message.content);

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

    return rawData;

  } catch (error) {
    console.error("Groq API Error", error);
    return { error: "Failed to fetch from Groq." };
  }
};