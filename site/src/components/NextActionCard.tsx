import { useState, useEffect } from 'react';
import { MAP_NODES, getNextNode } from '../data/mapNodes';
import { getCompletedMapNodes, getMapNodeStatus } from '../lib/progressStore';
import { useLearningMode } from './ModeToggle';

interface NextActionCardProps {
  onStartClick?: (href: string) => void;
}

// 60분 완주 Path 단계 정의
const PATH_STEPS = [
  {
    id: 'tools',
    step: 1,
    title: '도구 준비하기',
    description: 'VS Code, Git, Node.js 설치',
    estimatedTime: '10분',
    href: '/path/60min',
  },
  {
    id: 'frontend',
    step: 2,
    title: 'React로 UI 만들기',
    description: 'Vite + React로 프론트엔드 구축',
    estimatedTime: '15분',
    href: '/path/60min/frontend/react',
  },
  {
    id: 'backend',
    step: 3,
    title: 'API 서버 만들기',
    description: 'Hono로 백엔드 API 구축',
    estimatedTime: '20분',
    href: '/path/60min/backend/hono',
  },
  {
    id: 'connect',
    step: 4,
    title: '프론트-백엔드 연결',
    description: 'API 연동 및 CORS 설정',
    estimatedTime: '10분',
    href: '/path/60min/connect',
  },
  {
    id: 'deploy',
    step: 5,
    title: '배포하기',
    description: 'Cloudflare Pages + Cloud Run 배포',
    estimatedTime: '15분',
    href: '/path/60min/deploy',
  },
  {
    id: 'complete',
    step: 6,
    title: '완료!',
    description: '축하합니다! 첫 서비스를 배포했습니다',
    estimatedTime: '',
    href: '/path/60min/complete',
  },
];

export default function NextActionCard({ onStartClick }: NextActionCardProps) {
  const { mode } = useLearningMode();
  const [completedNodes, setCompletedNodes] = useState<string[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const completed = getCompletedMapNodes();
    setCompletedNodes(completed);

    // 현재 단계 계산: 완료된 노드 수에 따라
    // 간단히 completedNodes.length를 단계로 사용
    const stepIndex = Math.min(completed.length, PATH_STEPS.length - 1);
    setCurrentStepIndex(stepIndex);

    const handleProgressChange = () => {
      const newCompleted = getCompletedMapNodes();
      setCompletedNodes(newCompleted);
      setCurrentStepIndex(Math.min(newCompleted.length, PATH_STEPS.length - 1));
    };

    window.addEventListener('map-progress-change', handleProgressChange);
    window.addEventListener('storage', handleProgressChange);
    return () => {
      window.removeEventListener('map-progress-change', handleProgressChange);
      window.removeEventListener('storage', handleProgressChange);
    };
  }, []);

  const currentStep = PATH_STEPS[currentStepIndex];
  const progress = Math.round((currentStepIndex / (PATH_STEPS.length - 1)) * 100);
  const isCompleted = currentStepIndex >= PATH_STEPS.length - 1;

  const handleClick = () => {
    if (onStartClick) {
      onStartClick(currentStep.href);
    } else {
      window.location.href = currentStep.href;
    }
  };

  if (isCompleted) {
    return (
      <div className="p-6 bg-gradient-to-br from-success/20 to-success/5 rounded-xl border border-success/30">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-success/20">
            <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs text-success font-medium mb-1">60분 완주 완료!</p>
            <h3 className="text-lg font-bold text-white mb-2">축하합니다!</h3>
            <p className="text-sm text-text-secondary mb-4">
              첫 서비스 배포를 성공적으로 마쳤습니다. 이제 더 많은 기능을 추가해보세요.
            </p>
            <div className="flex gap-2">
              <a
                href="/map"
                className="px-4 py-2 text-sm font-medium bg-surface hover:bg-surface-elevated border border-border rounded-lg transition-colors"
              >
                Map 둘러보기
              </a>
              <a
                href="/map/auth"
                className="px-4 py-2 text-sm font-medium bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30 rounded-lg transition-colors"
              >
                인증 추가하기
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
      <div className="flex items-start gap-4">
        {/* 아이콘 */}
        <div className="p-3 rounded-xl bg-primary/20">
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-xs font-medium bg-primary/20 text-primary rounded">
              Step {currentStep.step}/6
            </span>
            {currentStep.estimatedTime && (
              <span className="text-xs text-text-secondary">
                예상 {currentStep.estimatedTime}
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-white mb-1">{currentStep.title}</h3>
          <p className="text-sm text-text-secondary mb-4">{currentStep.description}</p>

          {/* 진행 바 */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
              <span>60분 완주 진행률</span>
              <span className="text-primary font-medium">{progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-dark to-primary rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* 시작 버튼 */}
          <button
            onClick={handleClick}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary-hover text-background font-bold rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>{currentStepIndex === 0 ? '시작하기' : '계속하기'}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
