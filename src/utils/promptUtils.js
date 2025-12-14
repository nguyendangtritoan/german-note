// src/utils/promptUtils.js

export const buildSystemPrompt = (word, languages, grammarTopic = null, options = {}) => {
  const langInstruction = languages.map(l => `"${l.code}"`).join(', ');
  
  // Extract options with defaults
  const { includePlural = false, includeVerbForms = false } = options;

  // REUSABLE HIGH-PRIORITY INSTRUCTIONS
  const strictGrammarRules = `
    *** CRITICAL PRIORITY: GRAMMATICAL CORRECTNESS ***
    1. **CONJUGATION IS MANDATORY**: If "${word}" is a verb, you MUST conjugate it to match the subject of the sentence (e.g., Input "machen" -> Sentence "Ich mache..."). NEVER leave a verb in infinitive form if the sentence requires conjugation.
    2. **WORD ORDER**: Strictly follow standard German syntax (Verb in Position 2 for main clauses).
    3. **CASES**: Ensure correct declension (Nominative/Accusative/Dative/Genitive) for all nouns and adjectives.
    4. **HIGHLIGHTING**: Wrap the *conjugated/declined* form of the word in **double asterisks** (e.g., "Ich **mache** das.").
  `;

  const grammarInstruction = grammarTopic
    ? `6. CONSTRAINT: The example sentence must strictly use the grammar structure: "${grammarTopic}".
       ${strictGrammarRules}
       - **CONTEXT**: If "${word}" has multiple meanings, choose the one that fits this grammar topic best.`
    : `6. Provide one simple A2-level German example sentence.
       ${strictGrammarRules}`;

  const nounInstruction = includePlural 
    ? `2. If Noun: Provide 'article' (der, die, das) AND 'plural' (e.g. "die Häuser").` 
    : `2. If Noun: Provide 'article' (der, die, das).`;

  const verbInstruction = includeVerbForms
    ? `3. If Verb (including conjugated forms or participles):
       - Identify the INFINITIVE (Lemma) of the verb.
       - Set 'verbForms' to the standard principal parts of that Lemma: "Infinitive, Präteritum (3rd ps. sg.), Perfekt" (e.g., "empfehlen, empfahl, hat empfohlen").`
    : `3. If Verb: Set 'verbForms' to null.`;

  return `You are a strict German grammar teacher. Analyze the German word "${word}" and output RAW JSON.

1. Identify type (Noun, Verb, Adjective, etc).
${nounInstruction}
${verbInstruction}
4. Translate to: ${langInstruction} (Use the most common meaning).
5. Match "original" to input "${word}" (or its Lemma if input was conjugated).
${grammarInstruction}

IMPORTANT: Output ONLY valid JSON. Do not use Markdown code blocks (\`\`\`json).`;
};

// Shared Schema Definition
export const JSON_SCHEMA_STRING = `{
  "original": "string",
  "type": "string",
  "article": "string (or null)",
  "plural": "string (or null)",
  "verbForms": "string (or null)",
  "translationsList": [ { "code": "string", "text": "string" } ],
  "example": "string"
}`;