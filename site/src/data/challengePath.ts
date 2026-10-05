export type FrontendChoice = 'react' | 'vue';
export type BackendChoice = 'fastapi' | 'hono';
export const TRACK_STORAGE_KEY = 'choorai-60min-tracks';
export interface ChallengeTracks { frontend: FrontendChoice; backend: BackendChoice }
export function getChallengeTracks(): ChallengeTracks {
  const fallback: ChallengeTracks = { frontend: 'react', backend: 'fastapi' };
  if (typeof window === 'undefined') return fallback;
  try {
    const saved = JSON.parse(localStorage.getItem(TRACK_STORAGE_KEY) || '{}');
    return { frontend: saved.frontend === 'vue' ? 'vue' : 'react', backend: saved.backend === 'hono' ? 'hono' : 'fastapi' };
  } catch { return fallback; }
}
export function selectChallengeTracks(tracks: ChallengeTracks): void {
  localStorage.setItem(TRACK_STORAGE_KEY, JSON.stringify(tracks));
  window.dispatchEvent(new CustomEvent('60min-progress-change'));
}
export function getChallengePath(tracks: ChallengeTracks = { frontend: 'react', backend: 'fastapi' }) {
  return ['/path/60min', `/start/60min/frontend/${tracks.frontend}`, `/start/60min/backend/${tracks.backend}`, '/start/60min/connect', '/start/60min/deploy', '/start/60min/complete'];
}
export function getChallengeStepKeys(tracks: ChallengeTracks) {
  return ['60min-step1', `60min-frontend-${tracks.frontend}`, `60min-backend-${tracks.backend}`, '60min-connect', '60min-deploy'] as const;
}
