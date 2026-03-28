/**
 * Gemini API Client — Frontend Proxy Layer
 *
 * All Gemini requests go through the backend proxy (/api/process) rather than
 * calling the Gemini API directly from the browser. This design decision:
 *   - Keeps the GEMINI_API_KEY secret (never in the JS bundle)
 *   - Applies server-side rate limiting and input validation
 *   - Enables Firestore audit logging of all requests
 *   - Allows server-side language translation before Gemini processing
 *
 * Authentication: each request includes a Firebase ID token in the
 * Authorization header. The backend verifies this token before processing,
 * ensuring only signed-in users can consume the Gemini quota.
 */
import type { GeminiResponse, ProcessedInput } from '../types';
import { compressImage } from './imageUtils';
import { getIdToken } from './auth';

// In dev, Vite proxies /api → localhost:3001 (VITE_API_URL should be empty)
// In prod, set VITE_API_URL to your backend Cloud Run URL
const API_BASE: string = import.meta.env.VITE_API_URL ?? '';

export class GeminiService {
  private controller: AbortController | null = null;

  /**
   * Cancels any in-flight request. Called when the user navigates away
   * or hits "reset" during processing to avoid stale state updates.
   */
  cancelRequest(): void {
    this.controller?.abort();
  }

  /**
   * Sends the user's input to the backend for Gemini processing.
   *
   * For image inputs, the file is compressed client-side (max 1920px, 80%
   * quality) before base64 encoding to keep the request body under 10MB.
   *
   * The Firebase ID token is attached as a Bearer token. If the token is
   * unavailable (e.g. session expired), the request still proceeds — the
   * backend will return 401 and the error surfaces to the user.
   */
  async processInput(input: ProcessedInput): Promise<GeminiResponse> {
    this.controller = new AbortController();

    // Compress images client-side to reduce bandwidth before sending to backend
    let imageData: string | undefined;
    if (input.type === 'image' && input.file) {
      imageData = await compressImage(input.file);
    }

    // Attach Firebase auth token so the backend can verify the user's identity
    const token = await getIdToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let response: Response;
    try {
      response = await fetch(`${API_BASE}/api/process`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type: input.type,
          content: input.content,
          imageData,
          mimeType: input.file?.type,
        }),
        signal: this.controller.signal,
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('Request was cancelled');
      }
      throw new Error('Could not reach the server. Is the backend running?');
    }

    if (!response.ok) {
      const body = await response.json().catch(() => ({ error: 'Server error' }));
      throw new Error(body.error || `Server error: ${response.status}`);
    }

    return response.json() as Promise<GeminiResponse>;
  }
}

export const geminiService = new GeminiService();
