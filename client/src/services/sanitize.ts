/* Universal Bridge — Input Sanitization Service */
import DOMPurify from 'dompurify';

/**
 * Sanitizes user input to prevent XSS attacks
 * Uses DOMPurify to strip dangerous HTML/script content
 */
export function sanitizeInput(input: string): string {
  if (typeof window === 'undefined') {
    // Server-side fallback - strip all HTML
    return input.replace(/<[^>]*>/g, '');
  }
  
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML allowed
    ALLOWED_ATTR: [], // No attributes allowed
    KEEP_CONTENT: true,
  });
}

/**
 * Sanitizes HTML content for display
 * Allows safe HTML tags while removing dangerous ones
 */
export function sanitizeHtml(input: string): string {
  if (typeof window === 'undefined') {
    return input.replace(/<script[^>]*>.*?<\/script>/gi, '');
  }
  
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
  });
}

/**
 * Validates and sanitizes file name
 */
export function sanitizeFileName(fileName: string): string {
  // Remove path traversal attempts and dangerous characters
  return fileName
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\.{2,}/g, '.')
    .trim();
}

/**
 * Checks if string contains potential XSS vectors
 */
export function containsXss(input: string): boolean {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
}
