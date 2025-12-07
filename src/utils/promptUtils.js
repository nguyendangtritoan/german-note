export const buildSystemPrompt = (word, languages, grammarTopic = null) => {
  const langInstruction = languages.map(l => `"${l.code}"`).join(', ');

  // IMPROVED: Added strict Quality Control & "Natural Flow" instructions
  const grammarInstruction = grammarTopic
    ? `6. CONSTRAINT: The example sentence must strictly use the grammar structure: "${grammarTopic}". 
       - Adjust complexity to match this grammar level. 
       - If "${word}" is a noun, make it the focus. 
       - **CRITICAL**: If the grammar topic implies a choice (e.g. "kein vs nicht", "haben or sein"), choose ONLY ONE that fits the context best.
       - **QUALITY CONTROL**: Ensure the sentence is 100% grammatically correct Standard German. Do NOT force words into invalid positions (e.g. never say "Ich zu hoffen"). The grammar rule must fit NATURALLY into the sentence syntax.
       - IMPORTANT: Wrap ONLY the specific words/endings that illustrate this grammar rule in **double asterisks**. Do NOT bold the entire sentence.`
    : `6. Provide one simple A2-level German example sentence.`;

  return `You are an expert German linguist. Analyze the German word "${word}" and output strict JSON.

1. Identify type (Noun, Verb, Adjective, etc).
2. If Noun, provide article (der, die, das). Else null.
3. Translate to: ${langInstruction}.
4. Match "original" to input "${word}".
${grammarInstruction}

Output must follow the specified JSON schema exactly.`;
};

// Shared Schema Definition
export const JSON_SCHEMA_STRING = `{
  "original": "string",
  "type": "string",
  "article": "string (or null)",
  "translationsList": [ { "code": "string", "text": "string" } ],
  "example": "string"
}`;