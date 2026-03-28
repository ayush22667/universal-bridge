import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { FieldValue } from 'firebase-admin/firestore';
import { processWithGemini } from '../lib/gemini.js';
import { log } from '../lib/logger.js';

export function processRouter(db) {
  const router = Router();
  const requests = db.collection('requests');

  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please wait a moment and try again.' },
  });

  router.post('/', limiter, async (req, res) => {
    const requestId = Math.random().toString(36).substring(2, 15);

    log('info', 'Processing request', { requestId, type: req.body.type });

    try {
      const { type, content, imageData, mimeType } = req.body;

      if (!content && !imageData) {
        log('warn', 'Missing content or imageData', { requestId });
        return res.status(400).json({ error: 'content or imageData is required' });
      }

      log('debug', 'Calling Gemini API', {
        requestId,
        type,
        contentLength: content?.length || 0,
        hasImage: !!imageData,
      });

      const parsed = await processWithGemini({ type, content, imageData, mimeType });

      log('info', 'Request successful', {
        requestId,
        actionCount: parsed.actions.length,
        urgency: parsed.actions[0]?.urgency || 'info',
      });

      requests.add({
        type: type || 'text',
        input: content ? content.slice(0, 500) : '[image]',
        summary: parsed.summary,
        actionCount: parsed.actions.length,
        urgency: parsed.actions[0]?.urgency || 'info',
        timestamp: FieldValue.serverTimestamp(),
      }).catch(err => log('warn', 'Firestore write failed (non-fatal)', { requestId, error: err.message }));

      return res.json(parsed);

    } catch (error) {
      log('error', 'Error processing request', {
        requestId,
        error: error.message,
        stack: error.stack,
      });

      const message = error instanceof Error ? error.message : 'Internal server error';
      return res.status(500).json({ error: message });
    }
  });

  return router;
}
