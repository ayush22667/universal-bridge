/**
 * Firebase Authentication Middleware
 *
 * Verifies Firebase ID tokens on every protected API request.
 * This ensures only authenticated Google-signed-in users can access
 * the Gemini processing endpoint, preventing unauthorized API usage
 * and protecting backend costs.
 *
 * Flow: client signs in via Google → Firebase issues a short-lived ID token →
 * client attaches it as `Authorization: Bearer <token>` → this middleware
 * validates it against Firebase Admin SDK before any processing occurs.
 */
import { getAuth } from 'firebase-admin/auth';
import { log } from './logger.js';

/**
 * Express middleware that validates a Firebase ID token from the
 * Authorization header. Attaches the decoded token payload to `req.user`
 * so downstream handlers can access the authenticated user's uid and email.
 */
export async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization;

  // Reject requests with no Bearer token — never process unauthenticated input
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: missing token' });
  }

  const token = authHeader.slice(7);
  try {
    // Firebase Admin SDK verifies the token signature, expiry, and audience
    // without a network round-trip (uses cached public keys)
    const decoded = await getAuth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    // Log at warn level — this is expected for expired/tampered tokens
    log('warn', 'Invalid Firebase token', { error: err.message });
    return res.status(401).json({ error: 'Unauthorized: invalid token' });
  }
}
