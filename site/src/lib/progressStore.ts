// 60분 완주 챌린지 진행률 관리

export const CHALLENGE_STEPS = {
  '60min-step1': { totalItems: 3 },
  '60min-frontend-react': { totalItems: 4 },
  '60min-frontend-vue': { totalItems: 4 },
  '60min-backend-fastapi': { totalItems: 4 },
  '60min-backend-hono': { totalItems: 4 },
  '60min-connect': { totalItems: 4 },
  '60min-deploy': { totalItems: 4 },
} as const;

export type StepKey = keyof typeof CHALLENGE_STEPS;

// 전체 진행률 계산 (0-100)
export function calculateOverallProgress(): number {
  if (typeof window === 'undefined') return 0;

  // 사용자가 선택한 경로 감지 (React vs Vue, FastAPI vs Hono)
  const frontendKey = localStorage.getItem('checklist-60min-frontend-vue')
    ? '60min-frontend-vue'
    : '60min-frontend-react';
  const backendKey = localStorage.getItem('checklist-60min-backend-hono')
    ? '60min-backend-hono'
    : '60min-backend-fastapi';

  // 실제로 사용된 단계들만 계산
  const activeSteps: StepKey[] = [
    '60min-step1',
    frontendKey as StepKey,
    backendKey as StepKey,
    '60min-connect',
    '60min-deploy',
  ];

  let totalItems = 0;
  let completedItems = 0;

  activeSteps.forEach((key) => {
    const config = CHALLENGE_STEPS[key];
    totalItems += config.totalItems;

    const saved = localStorage.getItem(`checklist-${key}`);
    if (saved) {
      try {
        const items = JSON.parse(saved) as string[];
        completedItems += Math.min(items.length, config.totalItems);
      } catch {
        // JSON 파싱 실패 시 무시
      }
    }
  });

  return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
}

// 현재 단계 계산 (1-6)
export function calculateCurrentStep(): number {
  if (typeof window === 'undefined') return 1;

  const progress = calculateOverallProgress();
  if (progress === 0) return 1;
  if (progress === 100) return 6;

  // 5단계 (19개 항목) 기준으로 현재 단계 계산
  // Step 1: 0-16%, Step 2: 17-33%, Step 3: 34-50%, Step 4: 51-67%, Step 5: 68-84%, Step 6: 85-100%
  if (progress < 17) return 1;
  if (progress < 34) return 2;
  if (progress < 51) return 3;
  if (progress < 68) return 4;
  if (progress < 85) return 5;
  return 6;
}

// 커스텀 이벤트로 진행률 변경 알림 (같은 탭 내)
export function notifyProgressChange(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('60min-progress-change'));
}

// 진행률 초기화
export function resetProgress(): void {
  if (typeof window === 'undefined') return;

  Object.keys(CHALLENGE_STEPS).forEach((key) => {
    localStorage.removeItem(`checklist-${key}`);
  });

  notifyProgressChange();
}
