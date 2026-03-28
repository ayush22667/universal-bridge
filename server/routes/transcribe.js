import { Router } from 'express';
import { log } from '../lib/logger.js';

const API_KEY = process.env.GOOGLE_CLOUD_API_KEY;

export function transcribeRouter() {
  const router = Router();

  router.post('/', async (req, res) => {
    const { audioBase64, mimeType = 'audio/webm;codecs=opus' } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: 'audioBase64 is required' });
    }

    if (!API_KEY) {
      return res.status(503).json({ error: 'Speech API not configured (GOOGLE_CLOUD_API_KEY)' });
    }

    try {
      const encoding = mimeType.includes('webm') ? 'WEBM_OPUS'
        : mimeType.includes('ogg') ? 'OGG_OPUS'
        : mimeType.includes('mp4') ? 'MP4'
        : 'LINEAR16';

      const response = await fetch(
        `https://speech.googleapis.com/v1/speech:recognize?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            config: {
              encoding,
              sampleRateHertz: 48000,
              languageCode: 'en-US',
              enableAutomaticPunctuation: true,
              model: 'latest_long',
              alternativeLanguageCodes: ['hi-IN', 'es-ES', 'fr-FR', 'ar-XA', 'zh'],
            },
            audio: { content: audioBase64 },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        log('error', 'Speech API error', { error: data.error?.message });
        return res.status(500).json({ error: data.error?.message || 'Speech recognition failed' });
      }

      const transcript = data.results
        ?.map(r => r.alternatives?.[0]?.transcript || '')
        .join(' ')
        .trim();

      if (!transcript) {
        return res.status(422).json({ error: 'No speech detected. Please speak clearly and try again.' });
      }

      log('info', 'Transcription successful', { length: transcript.length });
      return res.json({ transcript });

    } catch (err) {
      log('error', 'Transcription failed', { error: err.message });
      return res.status(500).json({ error: 'Transcription failed' });
    }
  });

  return router;
}
