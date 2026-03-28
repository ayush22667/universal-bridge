import { describe, it, expect } from 'vitest';
import { sanitizeInput, sanitizeHtml, sanitizeFileName, containsXss } from '../services/sanitize';

describe('sanitizeInput', () => {
  it('should strip HTML tags from input', () => {
    const input = '<script>alert("xss")</script>Hello World';
    expect(sanitizeInput(input)).toBe('Hello World');
  });

  it('should return plain text unchanged', () => {
    const input = 'Hello World';
    expect(sanitizeInput(input)).toBe('Hello World');
  });
});

describe('sanitizeHtml', () => {
  it('should allow safe HTML tags', () => {
    const input = '<b>Bold</b> and <i>italic</i>';
    expect(sanitizeHtml(input)).toBe('<b>Bold</b> and <i>italic</i>');
  });

  it('should remove script tags', () => {
    const input = '<script>alert("xss")</script><p>Safe</p>';
    expect(sanitizeHtml(input)).toBe('<p>Safe</p>');
  });
});

describe('sanitizeFileName', () => {
  it('should replace dangerous characters', () => {
    expect(sanitizeFileName('file:name?.txt')).toBe('file_name_.txt');
  });

  it('should handle path traversal attempts', () => {
    expect(sanitizeFileName('../../../etc/passwd').includes('etc_passwd')).toBe(true);
  });
});

describe('containsXss', () => {
  it('should detect script tags', () => {
    expect(containsXss('<script>alert(1)</script>')).toBe(true);
  });

  it('should detect javascript: protocol', () => {
    expect(containsXss('javascript:alert(1)')).toBe(true);
  });

  it('should detect event handlers', () => {
    expect(containsXss('<div onclick="alert(1)">')).toBe(true);
  });

  it('should return false for safe text', () => {
    expect(containsXss('Hello World')).toBe(false);
  });
});
