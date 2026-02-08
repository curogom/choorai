import { useState, useEffect } from 'react';
import { MAP_NODES, getNextNode } from '../data/mapNodes';
import { getCompletedMapNodes, getMapNodeStatus } from '../lib/progressStore';
import { useLearningMode } from './ModeToggle';

interface NextActionCardProps {
  locale?: string;
  onStartClick?: (href: string) => void;
}

interface PathStep {
  id: string;
  step: number;
  title: string;
  description: string;
  estimatedTime: string;
  href: string;
}

const PATH_STEPS_KO: PathStep[] = [
  { id: 'tools', step: 1, title: '도구 준비하기', description: 'VS Code, Git, Node.js 설치', estimatedTime: '10분', href: '/path/60min' },
  { id: 'frontend', step: 2, title: 'React로 UI 만들기', description: 'Vite + React로 프론트엔드 구축', estimatedTime: '15분', href: '/start/60min/frontend/react' },
  { id: 'backend', step: 3, title: 'API 서버 만들기', description: 'Hono로 백엔드 API 구축', estimatedTime: '20분', href: '/start/60min/backend/hono' },
  { id: 'connect', step: 4, title: '프론트-백엔드 연결', description: 'API 연동 및 CORS 설정', estimatedTime: '10분', href: '/start/60min/connect' },
  { id: 'deploy', step: 5, title: '배포하기', description: 'Cloudflare Pages + Cloud Run 배포', estimatedTime: '15분', href: '/start/60min/deploy' },
  { id: 'complete', step: 6, title: '완료!', description: '축하합니다! 첫 서비스를 배포했습니다', estimatedTime: '', href: '/start/60min/complete' },
];

const PATH_STEPS_EN: PathStep[] = [
  { id: 'tools', step: 1, title: 'Set Up Tools', description: 'Install VS Code, Git, Node.js', estimatedTime: '10 min', href: '/en/path/60min' },
  { id: 'frontend', step: 2, title: 'Build UI with React', description: 'Build frontend with Vite + React', estimatedTime: '15 min', href: '/en/start/60min/frontend/react' },
  { id: 'backend', step: 3, title: 'Build API Server', description: 'Build backend API with Hono', estimatedTime: '20 min', href: '/en/start/60min/backend/hono' },
  { id: 'connect', step: 4, title: 'Connect Front & Back', description: 'API integration & CORS setup', estimatedTime: '10 min', href: '/en/start/60min/connect' },
  { id: 'deploy', step: 5, title: 'Deploy', description: 'Deploy to Cloudflare Pages + Cloud Run', estimatedTime: '15 min', href: '/en/start/60min/deploy' },
  { id: 'complete', step: 6, title: 'Done!', description: 'Congratulations! You deployed your first service', estimatedTime: '', href: '/en/start/60min/complete' },
];

const i18n = {
  ko: {
    completeBadge: '60분 완주 완료!',
    completeTitle: '축하합니다!',
    completeDesc: '첫 서비스 배포를 성공적으로 마쳤습니다. 이제 더 많은 기능을 추가해보세요.',
    browseMap: 'Map 둘러보기',
    addAuth: '인증 추가하기',
    estimated: '예상',
    progressLabel: '60분 완주 진행률',
    start: '시작하기',
    continue: '계속하기',
    mapHref: '/map',
    authHref: '/map/auth',
  },
  en: {
    completeBadge: '60-Minute Challenge Complete!',
    completeTitle: 'Congratulations!',
    completeDesc: 'You successfully deployed your first service. Now try adding more features.',
    browseMap: 'Browse Map',
    addAuth: 'Add Auth',
    estimated: 'Est.',
    progressLabel: '60-min challenge progress',
    start: 'Get Started',
    continue: 'Continue',
    mapHref: '/en/map',
    authHref: '/en/map/auth',
  },
};

export default function NextActionCard({ locale = 'ko', onStartClick }: NextActionCardProps) {
  const { mode } = useLearningMode();
  const [completedNodes, setCompletedNodes] = useState<string[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const t = locale === 'en' ? i18n.en : i18n.ko;
  const PATH_STEPS = locale === 'en' ? PATH_STEPS_EN : PATH_STEPS_KO;

  useEffect(() => {
    const completed = getCompletedMapNodes();
    setCompletedNodes(completed);
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
            <p className="text-xs text-success font-medium mb-1">{t.completeBadge}</p>
            <h3 className="text-lg font-bold text-white mb-2">{t.completeTitle}</h3>
            <p className="text-sm text-text-secondary mb-4">{t.completeDesc}</p>
            <div className="flex gap-2">
              <a href={t.mapHref} className="px-4 py-2 text-sm font-medium bg-surface hover:bg-surface-elevated border border-border rounded-lg transition-colors">
                {t.browseMap}
              </a>
              <a href={t.authHref} className="px-4 py-2 text-sm font-medium bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30 rounded-lg transition-colors">
                {t.addAuth}
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
        <div className="p-3 rounded-xl bg-primary/20">
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-xs font-medium bg-primary/20 text-primary rounded">
              Step {currentStep.step}/6
            </span>
            {currentStep.estimatedTime && (
              <span className="text-xs text-text-secondary">
                {t.estimated} {currentStep.estimatedTime}
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-white mb-1">{currentStep.title}</h3>
          <p className="text-sm text-text-secondary mb-4">{currentStep.description}</p>
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
              <span>{t.progressLabel}</span>
              <span className="text-primary font-medium">{progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary-dark to-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <button onClick={handleClick} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary-hover text-background font-bold rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98]">
            <span>{currentStepIndex === 0 ? t.start : t.continue}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
