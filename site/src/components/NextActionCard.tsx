import { useState, useEffect } from 'react';
import { calculateOverallProgress, CHALLENGE_STEPS, type StepKey } from '../lib/progressStore';

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

type FrontendChoice = 'react' | 'vue';
type BackendChoice = 'fastapi' | 'hono';

function detectFrontendChoice(): FrontendChoice {
  if (typeof window === 'undefined') return 'react';
  return localStorage.getItem('checklist-60min-frontend-vue') ? 'vue' : 'react';
}

function detectBackendChoice(): BackendChoice {
  if (typeof window === 'undefined') return 'fastapi';
  return localStorage.getItem('checklist-60min-backend-hono') ? 'hono' : 'fastapi';
}

function getCheckedCount(stepKey: StepKey): number {
  if (typeof window === 'undefined') return 0;
  const saved = localStorage.getItem(`checklist-${stepKey}`);
  if (!saved) return 0;
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

function getNextStepIndex(frontend: FrontendChoice, backend: BackendChoice): number {
  const frontendKey: StepKey = frontend === 'vue' ? '60min-frontend-vue' : '60min-frontend-react';
  const backendKey: StepKey = backend === 'hono' ? '60min-backend-hono' : '60min-backend-fastapi';

  const ordered: StepKey[] = ['60min-step1', frontendKey, backendKey, '60min-connect', '60min-deploy'];

  for (let i = 0; i < ordered.length; i++) {
    const key = ordered[i];
    const total = CHALLENGE_STEPS[key].totalItems;
    const done = Math.min(getCheckedCount(key), total);
    if (done < total) return i;
  }

  // 모든 체크리스트가 완료되면 완료 단계로 이동
  return 5;
}

function buildStepsKo(frontend: FrontendChoice, backend: BackendChoice): PathStep[] {
  const frontendTitle = frontend === 'vue' ? 'Vue로 UI 만들기' : 'React로 UI 만들기';
  const frontendDesc = frontend === 'vue' ? 'Vite + Vue로 프론트엔드 구축' : 'Vite + React로 프론트엔드 구축';
  const frontendHref = frontend === 'vue' ? '/start/60min/frontend/vue' : '/start/60min/frontend/react';

  const backendTitle = backend === 'hono' ? 'Hono로 API 서버 만들기' : 'FastAPI로 API 서버 만들기';
  const backendDesc = backend === 'hono' ? 'Hono로 백엔드 API 구축' : 'FastAPI로 백엔드 API 구축';
  const backendHref = backend === 'hono' ? '/start/60min/backend/hono' : '/start/60min/backend/fastapi';

  return [
    { id: 'tools', step: 1, title: '도구 준비하기', description: 'VS Code, Git, Node.js 설치', estimatedTime: '10분', href: '/path/60min' },
    { id: `frontend-${frontend}`, step: 2, title: frontendTitle, description: frontendDesc, estimatedTime: '15분', href: frontendHref },
    { id: `backend-${backend}`, step: 3, title: backendTitle, description: backendDesc, estimatedTime: '20분', href: backendHref },
    { id: 'connect', step: 4, title: '프론트-백엔드 연결', description: 'API 연동 및 CORS 설정', estimatedTime: '10분', href: '/start/60min/connect' },
    { id: 'deploy', step: 5, title: '배포하기', description: 'Cloudflare Pages + Cloud Run 배포', estimatedTime: '15분', href: '/start/60min/deploy' },
    { id: 'complete', step: 6, title: '완료!', description: '축하합니다! 첫 서비스를 배포했습니다', estimatedTime: '', href: '/start/60min/complete' },
  ];
}

function buildStepsEn(frontend: FrontendChoice, backend: BackendChoice): PathStep[] {
  const frontendTitle = frontend === 'vue' ? 'Build UI with Vue' : 'Build UI with React';
  const frontendDesc = frontend === 'vue' ? 'Build frontend with Vite + Vue' : 'Build frontend with Vite + React';
  const frontendHref = frontend === 'vue' ? '/en/start/60min/frontend/vue' : '/en/start/60min/frontend/react';

  const backendTitle = backend === 'hono' ? 'Build API Server with Hono' : 'Build API Server with FastAPI';
  const backendDesc = backend === 'hono' ? 'Build backend API with Hono' : 'Build backend API with FastAPI';
  const backendHref = backend === 'hono' ? '/en/start/60min/backend/hono' : '/en/start/60min/backend/fastapi';

  return [
    { id: 'tools', step: 1, title: 'Set Up Tools', description: 'Install VS Code, Git, Node.js', estimatedTime: '10 min', href: '/en/path/60min' },
    { id: `frontend-${frontend}`, step: 2, title: frontendTitle, description: frontendDesc, estimatedTime: '15 min', href: frontendHref },
    { id: `backend-${backend}`, step: 3, title: backendTitle, description: backendDesc, estimatedTime: '20 min', href: backendHref },
    { id: 'connect', step: 4, title: 'Connect Front & Back', description: 'API integration & CORS setup', estimatedTime: '10 min', href: '/en/start/60min/connect' },
    { id: 'deploy', step: 5, title: 'Deploy', description: 'Deploy to Cloudflare Pages + Cloud Run', estimatedTime: '15 min', href: '/en/start/60min/deploy' },
    { id: 'complete', step: 6, title: 'Done!', description: 'Congratulations! You deployed your first service', estimatedTime: '', href: '/en/start/60min/complete' },
  ];
}

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
  const [frontendChoice, setFrontendChoice] = useState<FrontendChoice>('react');
  const [backendChoice, setBackendChoice] = useState<BackendChoice>('fastapi');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);

  const t = locale === 'en' ? i18n.en : i18n.ko;
  const PATH_STEPS = locale === 'en'
    ? buildStepsEn(frontendChoice, backendChoice)
    : buildStepsKo(frontendChoice, backendChoice);

  useEffect(() => {
    const update = () => {
      const fe = detectFrontendChoice();
      const be = detectBackendChoice();
      setFrontendChoice(fe);
      setBackendChoice(be);
      setOverallProgress(calculateOverallProgress());
      setCurrentStepIndex(getNextStepIndex(fe, be));
    };

    // 초기 로드
    update();

    // 같은 탭에서의 변경 감지 (커스텀 이벤트)
    window.addEventListener('60min-progress-change', update);

    // 다른 탭에서의 변경 감지 (storage 이벤트)
    const handleStorage = (e: StorageEvent) => {
      if (e.key?.startsWith('checklist-60min')) update();
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('60min-progress-change', update);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const currentStep = PATH_STEPS[currentStepIndex];
  const isCompleted = overallProgress === 100;

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
              <span className="text-primary font-medium">{overallProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary-dark to-primary rounded-full transition-all duration-500" style={{ width: `${overallProgress}%` }} />
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
