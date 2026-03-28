import { describe, it, expect } from 'vitest';
import { validateFile, formatFileSize } from '../services/imageUtils';

describe('validateFile', () => {
  it('should validate allowed image types', () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const result = validateFile(file);
    expect(result.valid).toBe(true);
  });

  it('should reject files over 10MB', () => {
    const largeContent = new Array(11 * 1024 * 1024).fill('a').join('');
    const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });
    const result = validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('10MB');
  });

  it('should reject invalid file types', () => {
    const file = new File(['test'], 'test.exe', { type: 'application/x-msdownload' });
    const result = validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid file type');
  });

  it('should validate PDF files', () => {
    const file = new File(['test'], 'document.pdf', { type: 'application/pdf' });
    const result = validateFile(file);
    expect(result.valid).toBe(true);
  });
});

describe('formatFileSize', () => {
  it('should format bytes', () => {
    expect(formatFileSize(500)).toBe('500 Bytes');
  });

  it('should format kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
  });

  it('should format megabytes', () => {
    expect(formatFileSize(1024 * 1024 * 2.5)).toBe('2.5 MB');
  });

  it('should handle zero', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
  });
});
