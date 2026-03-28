import React from 'react';

interface ProcessingViewProps {
  isProcessing: boolean;
}

export const ProcessingView: React.FC<ProcessingViewProps> = ({ isProcessing }) => {
  if (!isProcessing) return null;

  return (
    <section 
      className="glass-card processing-pulse" 
      style={{ 
        padding: '2rem', 
        textAlign: 'center',
        marginTop: '1.5rem'
      }}
      aria-live="polite"
      aria-busy="true"
    >
      <div 
        className="spinner"
        style={{ 
          width: '48px', 
          height: '48px', 
          border: '3px solid var(--color-bg-tertiary)',
          borderTopColor: 'var(--color-accent-purple)',
          borderRadius: '50%',
          margin: '0 auto 1rem'
        }}
        aria-hidden="true"
      />
      <h3 style={{ marginBottom: '0.5rem' }}>Gemini is analyzing your input...</h3>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
        Extracting structured data and generating actionable insights
      </p>
      
      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
        {['Analyzing...', 'Structuring...', 'Generating actions...'].map((step) => (
          <span 
            key={step}
            style={{ 
              padding: '0.25rem 0.75rem',
              background: 'var(--color-bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.75rem',
              color: 'var(--color-text-secondary)'
            }}
          >
            {step}
          </span>
        ))}
      </div>
    </section>
  );
};
