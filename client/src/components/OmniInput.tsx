import React, { useState, useCallback, useMemo } from 'react';
import { VoiceRecorder } from './VoiceRecorder';
import { FileDropZone } from './FileDropZone';
import { sanitizeInput } from '../services/sanitize';
import type { InputTab, ProcessedInput } from '../types';

interface OmniInputProps {
  onSubmit: (input: ProcessedInput) => void;
  isProcessing: boolean;
}

export const OmniInput: React.FC<OmniInputProps> = React.memo(({ onSubmit, isProcessing }) => {
  const [activeTab, setActiveTab] = useState<InputTab>('text');
  const [textInput, setTextInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleTextSubmit = useCallback(() => {
    if (!textInput.trim()) return;
    
    const sanitized = sanitizeInput(textInput);
    onSubmit({
      type: 'text',
      content: sanitized,
    });
  }, [textInput, onSubmit]);

  const handleVoiceTranscript = useCallback((transcript: string) => {
    const sanitized = sanitizeInput(transcript);
    onSubmit({
      type: 'voice',
      content: sanitized,
    });
  }, [onSubmit]);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
  }, []);

  const handleFileSubmit = useCallback(() => {
    if (!selectedFile) return;
    
    onSubmit({
      type: 'image',
      content: `File uploaded: ${selectedFile.name}`,
      file: selectedFile,
      mimeType: selectedFile.type,
    });
  }, [selectedFile, onSubmit]);

  const tabs = useMemo(() => [
    { id: 'text' as InputTab, label: '📝 Text', ariaLabel: 'Text input' },
    { id: 'voice' as InputTab, label: '🎤 Voice', ariaLabel: 'Voice input' },
    { id: 'file' as InputTab, label: '📎 File', ariaLabel: 'File upload' },
  ], []);

  return (
    <section className="glass-card" style={{ overflow: 'hidden' }}>
      <div className="tabs" role="tablist" aria-label="Input type selection">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab ${activeTab === tab.id ? 'tab--active' : ''}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-label={tab.ariaLabel}
            id={`tab-${tab.id}`}
            aria-controls={`panel-${tab.id}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div 
        id="panel-text"
        role="tabpanel"
        aria-labelledby="tab-text"
        hidden={activeTab !== 'text'}
        style={{ padding: '1.5rem' }}
      >
        <textarea
          value={textInput}
          onChange={e => setTextInput(e.target.value)}
          placeholder="Describe a situation that needs action..."
          className="input"
          style={{ minHeight: '120px', resize: 'vertical' }}
          aria-label="Text description of situation"
          disabled={isProcessing}
        />
        <button
          onClick={handleTextSubmit}
          className="btn btn--primary"
          style={{ marginTop: '1rem', width: '100%' }}
          disabled={!textInput.trim() || isProcessing}
          aria-label="Process text input"
        >
          {isProcessing ? 'Processing...' : 'Analyze with Gemini'}
        </button>
      </div>

      <div 
        id="panel-voice"
        role="tabpanel"
        aria-labelledby="tab-voice"
        hidden={activeTab !== 'voice'}
      >
        <VoiceRecorder onTranscript={handleVoiceTranscript} />
      </div>

      <div 
        id="panel-file"
        role="tabpanel"
        aria-labelledby="tab-file"
        hidden={activeTab !== 'file'}
        style={{ padding: '1.5rem' }}
      >
        <FileDropZone onFileSelect={handleFileSelect} />
        {selectedFile && (
          <button
            onClick={handleFileSubmit}
            className="btn btn--primary"
            style={{ marginTop: '1rem', width: '100%' }}
            disabled={isProcessing}
            aria-label="Process uploaded file"
          >
            {isProcessing ? 'Processing...' : 'Analyze with Gemini'}
          </button>
        )}
      </div>
    </section>
  );
});

OmniInput.displayName = 'OmniInput';
