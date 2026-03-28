import React, { useState, useCallback, useRef } from 'react';

const API_BASE: string = import.meta.env.VITE_API_URL ?? '';

interface VoiceRecorderProps {
  onTranscript: (transcript: string) => void;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscript }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const startRecording = useCallback(async () => {
    setError(null);
    setTranscript('');
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.start(100);
      setIsRecording(true);
    } catch {
      setError('Could not access microphone. Please allow microphone permission and try again.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    const mediaRecorder = mediaRecorderRef.current;
    if (!mediaRecorder || mediaRecorder.state === 'inactive') return;

    setIsRecording(false);
    setProcessing(true);

    mediaRecorder.onstop = async () => {
      try {
        const mimeType = mediaRecorder.mimeType || 'audio/webm;codecs=opus';
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const base64Full = await blobToBase64(blob);
        const audioBase64 = base64Full.split(',')[1];

        const response = await fetch(`${API_BASE}/api/transcribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audioBase64, mimeType }),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error || 'Transcription failed');
        }

        const { transcript: t } = await response.json();
        setTranscript(t);
        onTranscript(t);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not transcribe audio. Try typing instead.');
      } finally {
        setProcessing(false);
      }
    };

    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(t => t.stop());
  }, [onTranscript]);

  const canRecord = !!navigator.mediaDevices?.getUserMedia;

  if (!canRecord) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
        <p>🎤 Microphone access is not available in your browser.</p>
        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
          Please use a modern browser with microphone support, or use the Text tab.
        </p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', padding: '1.5rem' }}>
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={processing}
        className={`btn ${isRecording ? 'btn--secondary' : 'btn--primary'}`}
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          fontSize: '2rem',
          marginBottom: '1rem',
        }}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        aria-pressed={isRecording}
      >
        {processing ? '⏳' : isRecording ? '⏹️' : '🎤'}
      </button>

      {isRecording && (
        <div className="voice-wave" style={{ justifyContent: 'center', marginBottom: '1rem' }} aria-hidden="true">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="voice-wave__bar" />
          ))}
        </div>
      )}

      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
        {processing
          ? '🔄 Transcribing via Google Speech-to-Text...'
          : isRecording
          ? '🔴 Recording... Click stop when done'
          : '🎤 Click to record — works in any browser'}
      </p>

      {transcript && !processing && (
        <div
          style={{
            marginTop: '1rem',
            padding: '1rem',
            background: 'var(--color-bg-tertiary)',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'left',
          }}
        >
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
            ✅ Transcript (Powered by Google Speech-to-Text):
          </p>
          <p>{transcript}</p>
        </div>
      )}

      {error && (
        <p role="alert" style={{ color: 'var(--color-urgency-critical)', marginTop: '1rem', fontSize: '0.875rem' }}>
          {error}
        </p>
      )}
    </div>
  );
};
