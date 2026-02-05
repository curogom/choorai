// 60분 완주 챌린지 진행률 관리 + Map 노드 완료 상태

import type { MapNode } from '../data/mapNodes';

// Map 노드 완료 상태 키
const MAP_NODE_STORAGE_KEY = 'choorai-map-completed-nodes';

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

// ===== Map 노드 완료 상태 관리 =====

// 완료된 Map 노드 목록 가져오기
export function getCompletedMapNodes(): string[] {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(MAP_NODE_STORAGE_KEY);
  if (!saved) return [];
  try {
    return JSON.parse(saved) as string[];
  } catch {
    return [];
  }
}

// Map 노드 완료 여부 확인
export function isMapNodeCompleted(nodeId: string): boolean {
  return getCompletedMapNodes().includes(nodeId);
}

// Map 노드 완료 처리
export function completeMapNode(nodeId: string): void {
  if (typeof window === 'undefined') return;
  const completed = getCompletedMapNodes();
  if (!completed.includes(nodeId)) {
    completed.push(nodeId);
    localStorage.setItem(MAP_NODE_STORAGE_KEY, JSON.stringify(completed));
    notifyMapProgressChange();
  }
}

// Map 노드 완료 취소
export function uncompleteMapNode(nodeId: string): void {
  if (typeof window === 'undefined') return;
  const completed = getCompletedMapNodes().filter((id) => id !== nodeId);
  localStorage.setItem(MAP_NODE_STORAGE_KEY, JSON.stringify(completed));
  notifyMapProgressChange();
}

// Map 노드 완료 상태 토글
export function toggleMapNodeCompletion(nodeId: string): void {
  if (isMapNodeCompleted(nodeId)) {
    uncompleteMapNode(nodeId);
  } else {
    completeMapNode(nodeId);
  }
}

// Map 진행률 변경 알림
export function notifyMapProgressChange(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('map-progress-change'));
}

// Map 노드 상태 계산 (Guided 모드용)
export type MapNodeStatus = 'completed' | 'current' | 'locked' | 'available';

export function getMapNodeStatus(
  nodeId: string,
  nodeOrder: number,
  mode: 'guided' | 'explore'
): MapNodeStatus {
  const completedNodes = getCompletedMapNodes();

  if (completedNodes.includes(nodeId)) {
    return 'completed';
  }

  if (mode === 'explore') {
    return 'available';
  }

  // Guided 모드: 이전 노드가 모두 완료되어야 접근 가능
  // order가 1인 노드는 항상 available
  if (nodeOrder === 1) {
    return 'current';
  }

  // 이전 order까지의 노드들이 완료되었는지 확인
  // 간단히 completedNodes.length >= nodeOrder - 1 로 체크
  if (completedNodes.length >= nodeOrder - 1) {
    return 'current';
  }

  return 'locked';
}

// Map 전체 초기화
export function resetMapProgress(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(MAP_NODE_STORAGE_KEY);
  notifyMapProgressChange();
}

// 전체 초기화 (60분 챌린지 + Map)
export function resetAllProgress(): void {
  resetProgress();
  resetMapProgress();
}
