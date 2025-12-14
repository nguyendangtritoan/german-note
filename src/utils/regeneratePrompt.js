export const buildRegeneratePrompt = (word, grammarTopic = null) => {
  const grammarInstruction = grammarTopic
    ? `CONSTRAINT: The sentence MUST strictly demonstrate the grammar topic: "${grammarTopic}".`
    : `CONSTRAINT: Use a simple A2/B1 sentence structure.`;

  return `You are a strict German Grammar Corrector.
Task: Generate a 100% grammatically correct example sentence for the word "${word}".

CRITICAL RULES:
1. **Conjugation**: If "${word}" is a verb, YOU MUST CONJUGATE it based on the subject (e.g., "Ich mache" NOT "Ich machen").
2. **Word Order**: Verb must be in the 2nd position for main clauses.
3. **Cases**: Ensure correct declension (Der/Die/Das/Den/Dem) for all nouns.
4. **Highlighting**: Wrap ONLY the conjugated form of "${word}" in **double asterisks**.

${grammarInstruction}

Output strictly JSON:
{
  "example": "Your corrected sentence here."
}`;
};