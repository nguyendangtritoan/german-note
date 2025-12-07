export const getMockData = (word, grammarTopic) => ({
  original: word,
  type: "noun (mock)",
  article: "das",
  // Removed verbForms
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