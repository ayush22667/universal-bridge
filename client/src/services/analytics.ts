/**
 * Firebase Analytics — Event Tracking
 *
 * Wraps Firebase Analytics logEvent calls with typed helpers.
 * All events are silently no-ops if Analytics failed to initialize
 * (e.g. ad-blocker, Safari private mode, missing measurementId).
 *
 * Events tracked:
 *   - analyze_input:       User submits text, voice, or image for processing
 *   - scenario_selected:   User clicks a quick-start scenario button
 *   - analysis_complete:   Gemini returned a successful structured response
 *   - analysis_error:      Gemini processing failed (network, validation, etc.)
 *   - login:               User completed Google Sign-In
 *   - logout:              User signed out
 *
 * These events power the Firebase Analytics dashboard and can be used to
 * understand which input types and scenarios are most valuable to users.
 */
import { logEvent } from 'firebase/analytics';
import { analytics } from './firebase';

/** Internal helper — no-ops gracefully if analytics is not initialized */
function track(event: string, params?: Record<string, unknown>) {
  if (!analytics) return;
  logEvent(analytics, event, params);
}

/** Fired when a user submits any input for Gemini processing */
export function trackAnalysis(inputType: string) {
  track('analyze_input', { input_type: inputType });
}

/** Fired when a user clicks one of the pre-built scenario buttons */
export function trackScenarioSelected(scenarioId: string) {
  track('scenario_selected', { scenario_id: scenarioId });
}

/** Fired when Gemini returns a valid structured response */
export function trackAnalysisComplete(actionCount: number, topUrgency: string) {
  track('analysis_complete', { action_count: actionCount, top_urgency: topUrgency });
}

/** Fired on any processing failure — message truncated to avoid PII in analytics */
export function trackAnalysisError(errorMessage: string) {
  track('analysis_error', { error_message: errorMessage.slice(0, 100) });
}

/** Fired after successful Google Sign-In */
export function trackSignIn() {
  track('login', { method: 'Google' });
}

/** Fired when user explicitly signs out */
export function trackSignOut() {
  track('logout');
}
