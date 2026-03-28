/**
 * Firebase Client Initialization
 *
 * Configures and exports the three Firebase services used by Universal Bridge:
 *   - Auth:      Google Sign-In (Firebase Authentication)
 *   - Analytics: Event tracking (Firebase Analytics / Google Analytics 4)
 *
 * All config values come from Vite environment variables (VITE_FIREBASE_*)
 * so no credentials are hardcoded in the bundle.
 *
 * The app is initialized once using getApps() guard to prevent duplicate
 * initialization during hot module replacement in development.
 */
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Reuse existing app instance during HMR; initialize fresh in production
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

/**
 * Firebase Authentication — used for Google Sign-In.
 * The auth instance is shared across the app via auth.ts helpers.
 */
export const auth = getAuth(app);

/**
 * Firebase Analytics — optional, gracefully degraded.
 * Analytics requires a measurementId (Google Analytics 4 property) and
 * browser support (not available in Safari private mode or with ad-blockers).
 * We check both conditions before initializing to avoid runtime errors.
 */
export let analytics: Awaited<ReturnType<typeof getAnalytics>> | null = null;
isSupported().then(supported => {
  if (supported && firebaseConfig.measurementId) {
    analytics = getAnalytics(app);
  }
});

export default app;
