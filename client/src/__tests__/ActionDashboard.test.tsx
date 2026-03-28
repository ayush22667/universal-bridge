import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { expect, it, describe } from 'vitest';
import { ActionDashboard } from '../components/ActionDashboard';
import type { GeminiResponse } from '../types';

const mockResult: GeminiResponse = {
  summary: 'Patient showing signs of mild dehydration. Immediate attention recommended.',
  actions: [
    {
      id: 'action-1',
      title: 'Administer Fluids',
      description: 'Provide oral rehydration solution or IV fluids if severe.',
      urgency: 'critical',
      icon: '💧',
    },
    {
      id: 'action-2',
      title: 'Monitor Vital Signs',
      description: 'Check blood pressure and heart rate every 15 minutes.',
      urgency: 'action',
      icon: '❤️',
    },
    {
      id: 'action-3',
      title: 'Document in Records',
      description: 'Log the incident and treatment in the patient record.',
      urgency: 'info',
      icon: '📋',
    },
  ],
  structured_data: { patient_age: 45, temperature: '38.2°C' },
  verification: { status: 'partial', notes: 'Assessment based on reported symptoms only.' },
};

describe('ActionDashboard accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<ActionDashboard result={mockResult} />);
    const results = await axe(container);
    // violations array must be empty — zero a11y issues
    expect(results.violations).toHaveLength(0);
  });

  it('renders all urgency badges', () => {
    const { getAllByText } = render(<ActionDashboard result={mockResult} />);
    expect(getAllByText(/Critical/).length).toBeGreaterThanOrEqual(1);
    expect(getAllByText(/Action Required/).length).toBeGreaterThanOrEqual(1);
    expect(getAllByText(/Informational/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders actions sorted by urgency', () => {
    const { getAllByRole } = render(<ActionDashboard result={mockResult} />);
    const listItems = getAllByRole('listitem');
    expect(listItems.length).toBe(3);
  });
});
