export const getMockData = (word, grammarTopic) => ({
  original: word,
  type: "noun (mock)",
  article: "das",
  // Removed verbForms
  translations: {
    en: `[Mock] Translation of ${word}`,
    vi: `[Mock] Bản dịch của ${word}`
  },
  example: grammarTopic 
    ? `[Mock] Satz mit **${grammarTopic}**: Der ${word} wurde getestet.` 
    : `Das ist ein einfacher Mocksatz für das Wort "${word}".`,
});