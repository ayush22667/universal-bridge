import type { SpeechRecognitionResult } from '../types';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export class SpeechService {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;

  isSupported(): boolean {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  startListening(
    onResult: (result: SpeechRecognitionResult) => void,
    onError: (error: string) => void
  ): void {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      onError('Speech recognition not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = event.results;
      if (results.length > 0) {
        const lastResult = results[results.length - 1];
        const transcript = lastResult[0].transcript;
        const confidence = lastResult[0].confidence;
        
        onResult({
          transcript,
          confidence,
          isFinal: lastResult.isFinal,
        });
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      onError(event.error);
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    this.recognition.start();
    this.isListening = true;
  }

  stopListening(): void {
    if (this.recognition) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  isActive(): boolean {
    return this.isListening;
  }
}

export const speechService = new SpeechService();
