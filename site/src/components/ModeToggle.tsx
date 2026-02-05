import { useState, useEffect } from 'react';

export type LearningMode = 'guided' | 'explore';

const STORAGE_KEY = 'choorai-learning-mode';

// 학습 모드 가져오기
export function getLearningMode(): LearningMode {
  if (typeof window === 'undefined') return 'guided';
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === 'explore' ? 'explore' : 'guided';
}

// 학습 모드 설정
export function setLearningMode(mode: LearningMode): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, mode);
  window.dispatchEvent(new CustomEvent('learning-mode-change', { detail: mode }));
}

interface ModeToggleProps {
  size?: 'sm' | 'md';
  showLabels?: boolean;
}

export default function ModeToggle({ size = 'md', showLabels = true }: ModeToggleProps) {
  const [mode, setMode] = useState<LearningMode>('guided');

  useEffect(() => {
    setMode(getLearningMode());

    const handleModeChange = (e: Event) => {
      const customEvent = e as CustomEvent<LearningMode>;
      setMode(customEvent.detail);
    };

    window.addEventListener('learning-mode-change', handleModeChange);
    return () => window.removeEventListener('learning-mode-change', handleModeChange);
  }, []);

  const handleToggle = (newMode: LearningMode) => {
    setLearningMode(newMode);
    setMode(newMode);
  };

  const isSmall = size === 'sm';

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => handleToggle('guided')}
        className={`
          flex items-center gap-1.5 rounded-lg transition-all
          ${isSmall ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'}
          ${mode === 'guided'
            ? 'bg-primary/20 text-primary border border-primary/30'
            : 'text-text-secondary hover:text-white hover:bg-surface'
          }
        `}
        aria-pressed={mode === 'guided'}
      >
        <span className={`w-2 h-2 rounded-full ${mode === 'guided' ? 'bg-primary' : 'bg-text-muted'}`} />
        {showLabels && <span>Guided</span>}
      </button>
      <button
        onClick={() => handleToggle('explore')}
        className={`
          flex items-center gap-1.5 rounded-lg transition-all
          ${isSmall ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'}
          ${mode === 'explore'
            ? 'bg-primary/20 text-primary border border-primary/30'
            : 'text-text-secondary hover:text-white hover:bg-surface'
          }
        `}
        aria-pressed={mode === 'explore'}
      >
        <span className={`w-2 h-2 rounded-full ${mode === 'explore' ? 'bg-primary' : 'bg-text-muted'}`} />
        {showLabels && <span>Explore</span>}
      </button>
    </div>
  );
}

// Hook for using learning mode in other components
export function useLearningMode() {
  const [mode, setMode] = useState<LearningMode>('guided');

  useEffect(() => {
    setMode(getLearningMode());

    const handleModeChange = (e: Event) => {
      const customEvent = e as CustomEvent<LearningMode>;
      setMode(customEvent.detail);
    };

    window.addEventListener('learning-mode-change', handleModeChange);
    return () => window.removeEventListener('learning-mode-change', handleModeChange);
  }, []);

  return { mode, setMode: setLearningMode };
}
