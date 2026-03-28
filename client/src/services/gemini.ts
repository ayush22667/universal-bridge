import type { GeminiResponse, ProcessedInput } from '../types';
import { compressImage } from './imageUtils';

// In dev, Vite proxies /api → localhost:3001 (VITE_API_URL should be empty)
// In prod, set VITE_API_URL to your backend Cloud Run URL
const API_BASE: string = import.meta.env.VITE_API_URL ?? '';

export class GeminiService {
  private controller: AbortController | null = null;

  cancelRequest(): void {
    this.controller?.abort();
  }

  async processInput(input: ProcessedInput): Promise<GeminiResponse> {
    this.controller = new AbortController();

    let imageData: string | undefined;
    if (input.type === 'image' && input.file) {
      imageData = await compressImage(input.file);
    }

    let response: Response;
    try {
      response = await fetch(`${API_BASE}/api/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
