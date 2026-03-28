import React from 'react';
import type { User } from 'firebase/auth';

interface HeaderProps {
  user: User | null;
  onSignOut: () => void;
  onSignIn: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onSignOut, onSignIn }) => (
  <header className="app__header">
    <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.5rem' }} aria-hidden="true">🌉</span>
        <span style={{ fontWeight: 600, fontSize: '1.125rem' }}>Universal Bridge</span>
      </div>

      {user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt={user.displayName ?? 'User avatar'}
              width={32}
              height={32}
              style={{ borderRadius: '50%', border: '2px solid var(--color-border)' }}
              referrerPolicy="no-referrer"
            />
          )}
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            {user.displayName}
          </span>
          <button
            onClick={onSignOut}
            className="btn btn--secondary"
            style={{ fontSize: '0.875rem' }}
            aria-label="Sign out"
          >
            Sign out
          </button>
        </div>
      ) : (
        <button
          onClick={onSignIn}
          className="btn btn--secondary"
          style={{ fontSize: '0.875rem' }}
          aria-label="Sign in with Google"
        >
          Sign in
        </button>
      )}
    </div>
  </header>
);
