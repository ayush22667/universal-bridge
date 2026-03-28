/* Universal Bridge — TypeScript Types & Interfaces */

export type UrgencyLevel = 'critical' | 'action' | 'info';

export interface Action {
  id: string;
  title: string;
  description: string;
  urgency: UrgencyLevel;
  icon: string;
  completed?: boolean;
}

export interface Location {
  lat: number;
  lng: number;
  description: string;
}

export interface VerificationStatus {
  status: 'verified' | 'partial' | 'unverified';
  notes: string;
}

export interface GeminiResponse {
  summary: string;
  actions: Action[];
  structured_data: Record<string, unknown>;
  location?: Location;
  verification: VerificationStatus;
}

export interface ProcessedInput {
  type: 'text' | 'voice' | 'image';
  content: string;
  file?: File;
  mimeType?: string;
}

export type InputTab = 'text' | 'voice' | 'file';

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export type ProcessingState = 'idle' | 'processing' | 'complete' | 'error';
