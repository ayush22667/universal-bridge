import React from 'react';

export const Header: React.FC = () => (
  <header className="app__header">
    <div className="container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.5rem' }} aria-hidden="true">🌉</span>
        <span style={{ fontWeight: 600, fontSize: '1.125rem' }}>Universal Bridge</span>
      </div>
    </div>
  </header>
);
