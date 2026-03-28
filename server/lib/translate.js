// Google Translate REST API — auto-detect language and translate to English
const TRANSLATE_KEY = process.env.GOOGLE_CLOUD_API_KEY;

const LANGUAGE_NAMES = {
  hi: 'Hindi', es: 'Spanish', fr: 'French', de: 'German', ar: 'Arabic',
  zh: 'Chinese', ja: 'Japanese', ko: 'Korean', pt: 'Portuguese',
  ru: 'Russian', it: 'Italian', nl: 'Dutch', tr: 'Turkish', pl: 'Polish',
  vi: 'Vietnamese', th: 'Thai', id: 'Indonesian', uk: 'Ukrainian',
};

export async function detectAndTranslate(text) {
  if (!TRANSLATE_KEY || !text || text.length < 10) {
    return { text, detectedLanguage: null };
  }

  try {
    // Detect language
    const detectRes = await fetch(
      `https://translation.googleapis.com/language/translate/v2/detect?key=${TRANSLATE_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: text }),
      }
    );
    const detectData = await detectRes.json();
    const langCode = detectData.data?.detections?.[0]?.[0]?.language;

    // Already English — skip translation
    if (!langCode || langCode === 'en') return { text, detectedLanguage: null };

    // Translate to English
    const translateRes = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${TRANSLATE_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: text, target: 'en', source: langCode, format: 'text' }),
      }
    );
    const translateData = await translateRes.json();
    const translated = translateData.data?.translations?.[0]?.translatedText;

    return {
      text: translated || text,
      detectedLanguage: LANGUAGE_NAMES[langCode] || langCode,
    };
  } catch {
    return { text, detectedLanguage: null };
  }
}
