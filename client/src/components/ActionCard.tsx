import React from 'react';
import type { Action } from '../types';

interface ActionCardProps {
  action: Action;
}

function makeCalendarUrl(title: string, description: string): string {
  const start = new Date();
  start.setDate(start.getDate() + 1);
  start.setHours(10, 0, 0, 0);
  const end = new Date(start);
  end.setHours(11, 0, 0, 0);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(description)}&dates=${fmt(start)}/${fmt(end)}`;
}

export const ActionCard: React.FC<ActionCardProps> = ({ action }) => {
  const urgencyConfig = {
    critical: { className: 'action-card--critical', badgeClass: 'badge--critical', label: 'Critical' },
    action: { className: 'action-card--action', badgeClass: 'badge--action', label: 'Action' },
    info: { className: 'action-card--info', badgeClass: 'badge--info', label: 'Info' },
  };

  const config = urgencyConfig[action.urgency];

  return (
    <div className={`action-card ${config.className}`} role="listitem">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.5rem' }} aria-hidden="true">{action.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
            <h4 style={{ fontWeight: 600 }}>{action.title}</h4>
            <span className={`badge ${config.badgeClass}`}>{config.label}</span>
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            {action.description}
          </p>
          {action.urgency === 'action' && (
            <a
              href={makeCalendarUrl(action.title, action.description)}
              target="_blank"
              rel="noopener noreferrer"
              className="calendar-link"
              aria-label={`Add "${action.title}" to Google Calendar`}
            >
              📅 Add to Google Calendar
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
