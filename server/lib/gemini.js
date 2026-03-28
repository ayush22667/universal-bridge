/**
 * Google Gemini AI Integration
 *
 * All Gemini API calls are made server-side to keep the API key out of the
 * browser bundle. The client sends input to our backend proxy, which calls
 * Gemini and returns structured JSON — never exposing credentials to the user.
 *
 * Uses the @google/generative-ai Node.js SDK with the model configured via
 * the GEMINI_MODEL environment variable (e.g. gemini-2.5-flash-lite).
 */
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL;

// Singleton client — reuse across requests to avoid repeated initialization
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * System prompt that instructs Gemini to act as an emergency triage assistant.
 * The strict JSON schema ensures consistent, machine-readable output that the
 * frontend can render without any post-processing or guesswork.
 */
const SYSTEM_PROMPT = `You are an AI assistant that converts unstructured real-world inputs into structured, actionable data for societal benefit.

Analyze the input and return a JSON object with this exact structure:
{
  "summary": "Brief situation assessment (1-2 sentences)",
  "actions": [
    {
      "id": "unique-id-1",
      "title": "Action title",
      "description": "Detailed description",
      "urgency": "critical|action|info",
      "icon": "emoji-relevant-to-action"
    }
  ],
  "structured_data": { any extracted key-value pairs },
  "location": { "lat": number, "lng": number, "description": "location name" } or null,
  "verification": { "status": "verified|partial|unverified", "notes": "verification notes" }
}

Urgency levels:
- critical: Life-threatening, immediate action required (call emergency services)
- action: Important, needs attention soon (contact doctor, schedule appointment)
- info: Informational, good to know (record for future reference)`;

/**
 * Validates the parsed Gemini response against the expected schema.
 * Acts as a defensive boundary — if the model returns an unexpected shape,
 * we surface a clear error rather than letting malformed data propagate
 * to the frontend and cause a confusing runtime crash.
 */
function validateGeminiResponse(obj) {
  if (!obj || typeof obj !== 'object') throw new Error('Response is not an object');
  if (typeof obj.summary !== 'string') throw new Error('Missing or invalid summary');
  if (!Array.isArray(obj.actions)) throw new Error('Missing or invalid actions array');
  if (!obj.verification || typeof obj.verification.status !== 'string') {
    throw new Error('Missing or invalid verification');
  }
  for (const action of obj.actions) {
    if (!action.id || !action.title || !action.urgency) {
      throw new Error('Action missing required fields (id, title, urgency)');
    }
  }
  return obj;
}

/**
 * Sends input to Gemini and returns a validated, structured response.
 *
 * Key implementation decisions:
 * - `responseMimeType: 'application/json'` forces Gemini to return valid JSON
 *   rather than prose, eliminating the need for fragile regex extraction and
 *   preventing "I'm sorry, I need more information" plain-text responses.
 * - Multimodal support: images are sent as base64 inlineData alongside the
 *   text prompt, allowing Gemini to analyze medical records, accident scenes, etc.
 * - The model instance is created per-request (lightweight) while the genAI
 *   client is a singleton shared across all requests.
 */
export async function processWithGemini({ type, content, imageData, mimeType }) {
  if (!GEMINI_MODEL) throw new Error('GEMINI_MODEL environment variable is required');

  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: SYSTEM_PROMPT,
    // Enforce JSON output — prevents free-text fallback responses from Gemini
    generationConfig: { responseMimeType: 'application/json' },
  });

  let result;

  if (type === 'image' && imageData) {
    // Multimodal request: text prompt + base64 image (JPEG/PNG/WebP/PDF)
    result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [
          { text: content || 'Analyze this image' },
          { inlineData: { data: imageData, mimeType: mimeType || 'image/jpeg' } },
        ],
      }],
    });
  } else {
    // Text-only request: covers text input and voice transcripts
    result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: content }],
      }],
    });
  }

  // Parse and validate before returning — never pass raw model output to the client
  return validateGeminiResponse(JSON.parse(result.response.text()));
}
