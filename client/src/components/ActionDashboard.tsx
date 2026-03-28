import React, { Suspense } from 'react';
import { ActionCard } from './ActionCard';
import { MapView } from './MapView';
import type { GeminiResponse } from '../types';

interface ActionDashboardProps {
  result: GeminiResponse;
}

export const ActionDashboard: React.FC<ActionDashboardProps> = ({ result }) => {
  const sortedActions = [...result.actions].sort((a, b) => {
    const urgencyOrder = { critical: 0, action: 1, info: 2 };
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  });

  const counts = result.actions.reduce(
    (acc, action) => {
      if (action.urgency === 'critical') acc.critical++;
      else if (action.urgency === 'action') acc.action++;
      else acc.info++;
      return acc;
    },
    { critical: 0, action: 0, info: 0 }
  );
  const criticalCount = counts.critical;
  const actionCount = counts.action;
  const infoCount = counts.info;

  return (
    <section className="glass-card" style={{ marginTop: '1.5rem' }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Analysis Results</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>{result.summary}</p>
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          {criticalCount > 0 && (
            <span className="badge badge--critical">
              <span aria-hidden="true">🔴</span> {criticalCount} Critical
            </span>
          )}
          {actionCount > 0 && (
            <span className="badge badge--action">
              <span aria-hidden="true">🟡</span> {actionCount} Action Required
            </span>
          )}
          {infoCount > 0 && (
            <span className="badge badge--info">
              <span aria-hidden="true">🟢</span> {infoCount} Informational
            </span>
          )}
        </div>
      </div>

      <div style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Recommended Actions</h3>
        <div role="list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {sortedActions.map(action => (
            <ActionCard key={action.id} action={action} />
          ))}
        </div>

        {result.structured_data && Object.keys(result.structured_data).length > 0 && (
          <div style={{ marginTop: '1.5rem' }} role="region" aria-labelledby="extracted-data-heading">
            <h3 id="extracted-data-heading" style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>Extracted Data</h3>
            <div 
              style={{ 
                background: 'var(--color-bg-tertiary)', 
                padding: '1rem', 
                borderRadius: 'var(--radius-lg)',
                fontSize: '0.875rem'
              }}
            >
              <pre style={{ margin: 0, overflow: 'auto' }} aria-label="Structured data output">
                {JSON.stringify(result.structured_data, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {result.location && (
          <div style={{ marginTop: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>Location</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
              {result.location.description}
            </p>
            <Suspense fallback={<div style={{ height: '300px', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-lg)' }} />}>  
              <MapView location={result.location} />
            </Suspense>
          </div>
        )}

        <div 
          style={{ 
            marginTop: '1.5rem', 
            padding: '1rem', 
            background: 'var(--color-bg-tertiary)', 
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span aria-hidden="true">
            {result.verification.status === 'verified' ? '✅' : 
             result.verification.status === 'partial' ? '⚠️' : '❓'}
          </span>
          <span style={{ fontSize: '0.875rem' }}>
            <strong>Verification:</strong> {result.verification.notes}
          </span>
        </div>
      </div>
    </section>
  );
};
