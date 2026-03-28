import { useState, useCallback, useEffect, Suspense } from 'react';
import type { User } from 'firebase/auth';
import { SkipLink } from './components/SkipLink';
import { Header } from './components/Header';
import { OmniInput } from './components/OmniInput';
import { ScenarioButtons } from './components/ScenarioButtons';
import { ProcessingView } from './components/ProcessingView';
import { ActionDashboard } from './components/ActionDashboard';
import { geminiService } from './services/gemini';
import { onAuthChange, signInWithGoogle, signOutUser } from './services/auth';
import {
  trackAnalysis,
  trackScenarioSelected,
  trackAnalysisComplete,
  trackAnalysisError,
  trackSignIn,
  trackSignOut,
} from './services/analytics';
import type { ProcessedInput, GeminiResponse, ProcessingState } from './types';

function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined); // undefined = loading
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [result, setResult] = useState<GeminiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return onAuthChange(setUser);
  }, []);

  const handleProcess = useCallback(async (input: ProcessedInput) => {
    setProcessingState('processing');
    setError(null);
    setResult(null);
    trackAnalysis(input.type);

    try {
      const response = await geminiService.processInput(input);
      setResult(response);
      setProcessingState('complete');
      trackAnalysisComplete(
        response.actions.length,
        response.actions[0]?.urgency ?? 'info'
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
      setProcessingState('error');
      trackAnalysisError(message);
    }
  }, []);

  const handleScenario = useCallback((prompt: string, scenarioId: string) => {
    trackScenarioSelected(scenarioId);
    handleProcess({ type: 'text', content: prompt });
  }, [handleProcess]);

  const handleReset = useCallback(() => {
    setResult(null);
    setError(null);
    setProcessingState('idle');
    geminiService.cancelRequest();
  }, []);

  const handleSignIn = useCallback(async () => {
    try {
      await signInWithGoogle();
      trackSignIn();
    } catch {
      // sign-in cancelled or failed — stay as guest
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    trackSignOut();
    await signOutUser();
    handleReset();
  }, [handleReset]);

  // Wait for auth state to resolve, then allow guests through
  if (user === undefined) return null;

  const isProcessing = processingState === 'processing';

  return (
    <div className="app">
      <SkipLink />
      <Header user={user} onSignIn={handleSignIn} onSignOut={handleSignOut} />

      <main id="main-content" className="app__main" role="main">
        <div className="container">
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

          {!isProcessing && (
            <>
              <OmniInput onSubmit={handleProcess} isProcessing={false} />
              {processingState === 'idle' && !result && (
                <ScenarioButtons onSelectScenario={handleScenario} disabled={false} />
              )}
            </>
          )}

          <ProcessingView isProcessing={isProcessing} />

          {processingState === 'error' && error && (
            <div className="error-card glass-card" role="alert">
              <span className="error-card__icon" aria-hidden="true">❌</span>
              <div className="error-card__text">
                <strong>Something went wrong</strong>
                <p>{error}</p>
              </div>
              <button className="btn btn--secondary" onClick={handleReset}>
                Try Again
              </button>
            </div>
          )}

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
