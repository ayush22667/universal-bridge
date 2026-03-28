import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL;
const genAI = new GoogleGenerativeAI(API_KEY);

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

export async function processWithGemini({ type, content, imageData, mimeType }) {
  if (!GEMINI_MODEL) throw new Error('GEMINI_MODEL environment variable is required');

  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: { responseMimeType: 'application/json' },
  });

  let result;

  if (type === 'image' && imageData) {
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
    result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: content }],
      }],
    });
  }

  return validateGeminiResponse(JSON.parse(result.response.text()));
}
