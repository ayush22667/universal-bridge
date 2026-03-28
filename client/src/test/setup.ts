import '@testing-library/jest-dom';
import { vi } from 'vitest';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    start: vi.fn(),
    stop: vi.fn(),
    abort: vi.fn(),
    continuous: false,
    interimResults: false,
    lang: '',
    onresult: null,
    onerror: null,
    onend: null,
  })),
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  value: window.SpeechRecognition,
});

class MockFileReader {
  onload: ((event: { target: { result: string } }) => void) | null = null;
  onerror: (() => void) | null = null;
  result: string = '';
  
  readAsDataURL(_file: File) {
    setTimeout(() => {
      this.result = 'data:image/jpeg;base64,mockbase64data';
      if (this.onload) {
        this.onload({ target: { result: this.result } });
      }
    }, 0);
  }
}

Object.defineProperty(window, 'FileReader', {
  writable: true,
  value: MockFileReader,
});

HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  drawImage: vi.fn(),
})) as unknown as typeof HTMLCanvasElement.prototype.getContext;

HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/jpeg;base64,compresseddata');
