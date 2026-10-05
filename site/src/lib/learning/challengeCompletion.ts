import { getChallengePath, getChallengeStepKeys, getChallengeTracks, type ChallengeTracks } from '../../data/challengePath';
import { CHALLENGE_STEPS } from '../progressStore';

type StageKey = ReturnType<typeof getChallengeStepKeys>[number];
export interface CompletionSnapshot {
  checkedItems: number;
  totalItems: number;
  completeStages: number;
  totalStages: number;
  progress: number;
  currentStep: number;
  isComplete: boolean;
  nextPath: string;
  blocked: boolean;
}

export function localizeChallengePath(path: string, locale: 'ko' | 'en'): string {
  if (locale === 'ko' || path.startsWith('/en/')) return path;
  return `/en${path}`;
}

export function readCompletionSnapshot(tracks: ChallengeTracks = getChallengeTracks()): CompletionSnapshot {
  const keys = getChallengeStepKeys(tracks);
  const route = getChallengePath(tracks);
  let checkedItems = 0;
  let totalItems = 0;
  let completeStages = 0;
  const counts: number[] = [];
  try {
    for (const key of keys) {
      const total = CHALLENGE_STEPS[key as StageKey].totalItems;
      totalItems += total;
      const raw = window.localStorage.getItem(`checklist-${key}`);
      let count = 0;
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) count = Math.min(new Set(parsed.filter((item): item is string => typeof item === 'string')).size, total);
      }
      checkedItems += count;
      counts.push(count);
      if (count === total) completeStages++;
    }
    const firstIncomplete = counts.findIndex((count, index) => count < CHALLENGE_STEPS[keys[index] as StageKey].totalItems);
    const currentStep = firstIncomplete === -1 ? keys.length : firstIncomplete;
    const isComplete = checkedItems === totalItems;
    return { checkedItems, totalItems, completeStages, totalStages: keys.length, progress: totalItems ? Math.round(checkedItems / totalItems * 100) : 0, currentStep, isComplete, nextPath: isComplete ? '/map/' : route[firstIncomplete], blocked: false };
  } catch {
    return { checkedItems: 0, totalItems, completeStages: 0, totalStages: keys.length, progress: 0, currentStep: 0, isComplete: false, nextPath: route[0], blocked: true };
  }
}
