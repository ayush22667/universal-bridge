import React, { useMemo } from 'react';

interface Scenario {
  id: string;
  icon: string;
  label: string;
  prompt: string;
}

interface ScenarioButtonsProps {
  onSelectScenario: (prompt: string) => void;
  disabled: boolean;
}

export const ScenarioButtons: React.FC<ScenarioButtonsProps> = React.memo(({ onSelectScenario, disabled }) => {
  const scenarios: Scenario[] = useMemo(() => [
    {
      id: 'medical',
      icon: '🏥',
      label: 'Medical Emergency',
      prompt: 'A 65-year-old male is experiencing sudden chest pain radiating to his left arm, shortness of breath, and cold sweats. He has a history of hypertension and diabetes. He is at home alone and his address is 123 Main Street, Springfield. What should be done immediately?',
    },
    {
      id: 'disaster',
      icon: '🌪️',
      label: 'Natural Disaster',
      prompt: 'A 6.5 magnitude earthquake just hit downtown Los Angeles. Reports of collapsed buildings near Wilshire Blvd. Multiple people trapped. Gas leaks reported in a 3-block radius. Power is out. What are the immediate actions needed?',
    },
    {
      id: 'accident',
      icon: '🚗',
      label: 'Road Accident',
      prompt: 'Multi-vehicle crash on Highway 101 near exit 42. At least 3 cars involved, one flipped over. Two people appear unconscious, one child is crying in the backseat. Fuel is leaking from one vehicle. Traffic is backed up for 2 miles. What should bystanders and emergency responders do?',
    },
    {
      id: 'prescription',
      icon: '💊',
      label: 'Prescription Analysis',
      prompt: 'Patient prescription reads: Metformin 500mg BID, Lisinopril 10mg QD, Atorvastatin 20mg QHS, Aspirin 81mg QD. Patient also takes OTC ibuprofen regularly for back pain. Patient reports dizziness and fatigue. Analyze this prescription for interactions, risks, and recommended actions.',
    },
    {
      id: 'missing',
      icon: '🔍',
      label: 'Missing Person',
      prompt: 'A 7-year-old girl named Priya has been missing for 2 hours from Central Park, New York. She was last seen wearing a red jacket and blue jeans near the Bethesda Fountain at 3:00 PM. She has a medical condition requiring insulin. What are the immediate steps to locate her?',
    },
    {
      id: 'fire',
      icon: '🔥',
      label: 'Building Fire',
      prompt: 'Fire reported on the 4th floor of an 8-story apartment building at 500 Oak Avenue. Smoke is visible from windows. Building has approximately 200 residents. Fire alarms are not sounding. Two elevators are currently in operation. What are the immediate actions for residents, building management, and fire department?',
    },
  ], []);

  return (
    <section className="scenarios-section" aria-label="Quick-start scenarios">
      <h2 className="scenarios-title">Try a scenario</h2>
      <div className="scenarios-grid">
        {scenarios.map(scenario => (
          <button
            key={scenario.id}
            onClick={() => onSelectScenario(scenario.prompt)}
            className="scenario-btn glass-card"
            disabled={disabled}
            aria-label={`Try scenario: ${scenario.label}`}
          >
            <span className="scenario-btn__icon" aria-hidden="true">{scenario.icon}</span>
            <span className="scenario-btn__label">{scenario.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
});

ScenarioButtons.displayName = 'ScenarioButtons';
