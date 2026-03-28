import React, { useState, useCallback } from 'react';
import { speechService } from '../services/speechService';

interface VoiceRecorderProps {
  onTranscript: (transcript: string) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscript }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const startRecording = useCallback(() => {
    setError(null);
    setTranscript('');
    
    speechService.startListening(
      (result) => {
        setTranscript(result.transcript);
        if (result.isFinal) {
          onTranscript(result.transcript);
        }
      },
      (err) => {
        setError(err);
        setIsRecording(false);
      }
    );
    
    setIsRecording(true);
  }, [onTranscript]);

  const stopRecording = useCallback(() => {
    speechService.stopListening();
    setIsRecording(false);
    if (transcript) {
      onTranscript(transcript);
    }
  }, [transcript, onTranscript]);

  if (!speechService.isSupported()) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
        <p>🎤 Voice input is not supported in your browser.</p>
        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
          Please use Chrome, Edge, or Safari for voice input.
        </p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', padding: '1.5rem' }}>
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`btn ${isRecording ? 'btn--secondary' : 'btn--primary'}`}
        style={{ 
          width: '80px', 
          height: '80px', 
          borderRadius: '50%',
          fontSize: '2rem',
          marginBottom: '1rem'
        }}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        aria-pressed={isRecording}
      >
        {isRecording ? '⏹️' : '🎤'}
      </button>

      {isRecording && (
        <div className="voice-wave" style={{ justifyContent: 'center', marginBottom: '1rem' }} aria-hidden="true">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="voice-wave__bar" />
          ))}
        </div>
      )}

      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
        {isRecording ? 'Listening... Click to stop' : 'Click the microphone to start'}
      </p>

      {transcript && (
        <div 
          style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            background: 'var(--color-bg-tertiary)', 
            borderRadius: 'var(--radius-lg)',
            textAlign: 'left'
          }}
        >
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
            Transcript:
          </p>
          <p>{transcript}</p>
        </div>
      )}

      {error && (
        <p role="alert" style={{ color: 'var(--color-urgency-critical)', marginTop: '1rem', fontSize: '0.875rem' }}>
          Error: {error}
        </p>
      )}
    </div>
  );
};
