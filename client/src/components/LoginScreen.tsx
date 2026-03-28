import React, { useState } from 'react';
import { signInWithGoogle } from '../services/auth';
import { trackSignIn } from '../services/analytics';

export const LoginScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      trackSignIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app__header">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }} aria-hidden="true">🌉</span>
            <span style={{ fontWeight: 600, fontSize: '1.125rem' }}>Universal Bridge</span>
          </div>
        </div>
      </header>

      <main
        id="main-content"
        className="app__main"
        role="main"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <div
          className="glass-card"
          style={{ maxWidth: '400px', width: '100%', padding: '2.5rem', textAlign: 'center', margin: '0 1rem' }}
        >
          <span style={{ fontSize: '3rem' }} aria-hidden="true">🌉</span>
          <h1 style={{ marginTop: '1rem', marginBottom: '0.5rem', fontSize: '1.5rem' }}>
            Universal Bridge
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', fontSize: '0.875rem' }}>
            Sign in to convert unstructured inputs into structured, life-saving actions.
          </p>

          <button
            onClick={handleSignIn}
            disabled={isLoading}
            className="btn btn--primary"
            style={{ width: '100%', gap: '0.75rem', padding: '0.75rem 1.5rem', fontSize: '1rem' }}
            aria-label="Sign in with Google"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
              <path fill="currentColor" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="currentColor" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
              <path fill="currentColor" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18z"/>
              <path fill="currentColor" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
            </svg>
            {isLoading ? 'Signing in...' : 'Sign in with Google'}
          </button>

          {error && (
            <p
              role="alert"
              style={{ color: 'var(--color-urgency-critical)', marginTop: '1rem', fontSize: '0.875rem' }}
            >
              {error}
            </p>
          )}
        </div>
      </main>

      <footer className="app__footer">
        <div className="container">
          <p>Powered by <strong>Google Gemini AI</strong> · Built for societal benefit</p>
        </div>
      </footer>
    </div>
  );
};
