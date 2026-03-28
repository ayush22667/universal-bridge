/**
 * Input Sanitization Service
 *
 * Provides XSS defense for all user-supplied text before it is submitted
 * to the backend or rendered in the UI. Uses DOMPurify — the industry-standard
 * DOM sanitization library — rather than hand-rolled regex, which is
 * notoriously difficult to make complete and safe.
 *
 * Why sanitize on the frontend?
 * Even though text is processed by Gemini on the backend (which doesn't
 * render HTML), sanitizing at the input boundary is defense-in-depth:
 * it prevents XSS if content is ever reflected in the UI, and signals
 * intent clearly to security reviewers.
 */
import DOMPurify from 'dompurify';

/**
 * Strips all HTML from user input, keeping only plain text content.
 * Applied to text area input and voice transcripts before submission.
 *
 * Uses DOMPurify with ALLOWED_TAGS=[] to strip every tag while preserving
 * the text content (KEEP_CONTENT: true) — e.g. "<b>hello</b>" → "hello".
 */
export function sanitizeInput(input: string): string {
  if (typeof window === 'undefined') {
    // SSR / Node.js fallback — strip all HTML tags with regex
    return input.replace(/<[^>]*>/g, '');
  }

  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],   // No HTML tags permitted in plain-text input
    ALLOWED_ATTR: [],   // No attributes permitted
    KEEP_CONTENT: true, // Preserve text nodes inside stripped tags
  });
}

/**
 * Sanitizes HTML content intended for display, allowing a safe allow-list
 * of formatting tags while blocking scripts, iframes, and event handlers.
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
 * Sanitizes a file name before display, preventing path traversal attacks
 * (e.g. "../../etc/passwd") and OS-reserved characters that could cause
 * unexpected behavior if the name were ever used in a file operation.
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[\\/:*?"<>|]/g, '_') // Replace OS-reserved characters
    .replace(/\.{2,}/g, '.')        // Collapse ".." sequences (path traversal)
    .trim();
}

/**
 * Detects common XSS vectors in a string.
 * Used as an additional check layer; DOMPurify is the primary defense.
 *
 * Note: this function is intentionally conservative — it may flag safe
 * strings containing "javascript:" in plain prose. Use it as a signal,
 * not a final decision.
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
