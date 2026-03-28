import { useState, useCallback, Suspense } from 'react';
import { SkipLink } from './components/SkipLink';
import { Header } from './components/Header';
import { OmniInput } from './components/OmniInput';
import { ScenarioButtons } from './components/ScenarioButtons';
import { ProcessingView } from './components/ProcessingView';
import { ActionDashboard } from './components/ActionDashboard';
import { geminiService } from './services/gemini';
import type { ProcessedInput, GeminiResponse, ProcessingState } from './types';

function App() {
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [result, setResult] = useState<GeminiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = useCallback(async (input: ProcessedInput) => {
    setProcessingState('processing');
    setError(null);
    setResult(null);

    try {
      const response = await geminiService.processInput(input);
      setResult(response);
      setProcessingState('complete');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
      setProcessingState('error');
    }
  }, []);

  const handleScenario = useCallback((text: string) => {
    handleProcess({ type: 'text', content: text });
  }, [handleProcess]);

  const handleReset = useCallback(() => {
    setResult(null);
    setError(null);
    setProcessingState('idle');
    geminiService.cancelRequest();
  }, []);

  const isProcessing = processingState === 'processing';

  return (
    <div className="app">
      <SkipLink />
      <Header />

      <main id="main-content" className="app__main" role="main">
        <div className="container">
          {/* Welcome section */}
          {processingState === 'idle' && !result && (
            <div className="welcome-section">
              <h1 className="welcome-title">
                Turn Chaos into <span className="gradient-text">Action</span>
              </h1>
              <p className="welcome-subtitle">
                Feed any unstructured input — voice, text, images, medical records — and get
                structured, verified, life-saving actions powered by Gemini AI.
              </p>
            </div>
          )}

          {/* Input area */}
          {!isProcessing && (
            <>
              <OmniInput
                onSubmit={handleProcess}
                isProcessing={isProcessing}
              />
              {processingState === 'idle' && !result && (
                <ScenarioButtons onSelectScenario={handleScenario} disabled={false} />
              )}
            </>
          )}

          {/* Processing */}
          <ProcessingView isProcessing={isProcessing} />

          {/* Error */}
          {processingState === 'error' && error && (
            <div className="error-card glass-card" role="alert">
              <span className="error-card__icon">❌</span>
              <div className="error-card__text">
                <strong>Something went wrong</strong>
                <p>{error}</p>
              </div>
              <button className="btn btn--secondary" onClick={handleReset}>
                Try Again
              </button>
            </div>
          )}

          {/* Results */}
          {processingState === 'complete' && result && (
            <Suspense fallback={<div className="loading-skeleton" />}>
              <ActionDashboard result={result} />
              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <button className="btn btn--secondary" onClick={handleReset}>
                  ← Analyze Something Else
                </button>
              </div>
            </Suspense>
          )}
        </div>
      </main>

      <footer className="app__footer">
        <div className="container">
          <p>Powered by <strong>Google Gemini AI</strong> · Built for societal benefit</p>
        </div>
      </footer>

    </div>
  );
}

export default App;
