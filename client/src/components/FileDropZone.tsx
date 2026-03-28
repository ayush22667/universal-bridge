import React, { useCallback, useState } from 'react';
import { validateFile, formatFileSize } from '../services/imageUtils';
import type { FileValidationResult } from '../types';

interface FileDropZoneProps {
  onFileSelect: (file: File) => void;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({ onFileSelect }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    setValidationError(null);

    const file = e.dataTransfer.files[0];
    if (file) {
      const validation = validateFile(file);
      if (validation.valid) {
        setSelectedFile(file);
        onFileSelect(file);
      } else {
        setValidationError(validation.error || 'Invalid file');
      }
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationError(null);
    const file = e.target.files?.[0];
    if (file) {
      const validation: FileValidationResult = validateFile(file);
      if (validation.valid) {
        setSelectedFile(file);
        onFileSelect(file);
      } else {
        setValidationError(validation.error || 'Invalid file');
      }
    }
  }, [onFileSelect]);

  return (
    <div style={{ padding: '1rem' }}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
        className={`drop-zone ${isDragActive ? 'drop-zone--active' : ''}`}
        role="button"
        tabIndex={0}
        aria-label="Drop zone for file upload"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            document.getElementById('file-input')?.click();
          }
        }}
      >
        <input
          id="file-input"
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.pdf"
          onChange={handleFileInput}
          style={{ display: 'none' }}
          aria-label="Choose file to upload"
        />
        
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📎</div>
        <p style={{ marginBottom: '0.5rem', fontWeight: 500 }}>
          Drag & drop a file here, or click to browse
        </p>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          Supports: JPG, PNG, WebP, PDF (max 10MB)
        </p>
      </div>

      {selectedFile && (
        <div 
          style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            background: 'var(--color-bg-tertiary)', 
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>📄</span>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <p style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {selectedFile.name}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
          <span style={{ color: 'var(--color-accent-emerald)' }}>✓</span>
        </div>
      )}

      {validationError && (
        <p role="alert" style={{ color: 'var(--color-urgency-critical)', marginTop: '1rem', fontSize: '0.875rem' }}>
          {validationError}
        </p>
      )}
    </div>
  );
};
