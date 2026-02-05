import { useState } from 'react';
import { useChallengeProgress } from '../hooks/useProgress';
import { resetProgress } from '../lib/progressStore';

interface ChallengeProgressBarProps {
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  showReset?: boolean;
}

export default function ChallengeProgressBar({
  label = '60분 완주 챌린지',
  showPercentage = true,
  size = 'md',
  glow = true,
  showReset = true,
}: ChallengeProgressBarProps) {
  const { progress, currentStep } = useChallengeProgress();
  const [showConfirm, setShowConfirm] = useState(false);

  const sublabel = progress === 100 ? '완료!' : `Step ${currentStep}/6`;

  const handleReset = () => {
    resetProgress();
    setShowConfirm(false);
  };

  const showResetButton = showReset && progress > 0;

  return (
    <div className="relative w-full">
      {/* 상단: 라벨 + 퍼센트 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
              />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-white">{label}</p>
            <p className="text-xs text-text-secondary">{sublabel}</p>
          </div>
        </div>
        {showPercentage && (
          <span className="text-2xl font-black text-primary">{progress}%</span>
        )}
      </div>

      {/* 하단: 프로그래스 바 + 리셋 버튼 */}
      <div className="flex items-center gap-2 py-2">
        <div className="flex-1 min-w-0">
          <div className={`w-full bg-border rounded-full ${size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2'}`}>
            <div
              className={`
                h-full rounded-full transition-all duration-500 ease-out
                bg-gradient-to-r from-primary-dark to-primary
                ${glow ? 'shadow-[0_0_10px_rgba(87,171,255,0.8)]' : ''}
              `}
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        {/* 리셋 버튼 - 진행률이 있을 때만 표시 */}
        {showResetButton && (
          <button
            onClick={() => setShowConfirm(true)}
            className="flex-shrink-0 p-1.5 text-text-secondary hover:text-white hover:bg-surface rounded-lg transition-colors"
            title="진행률 초기화"
            aria-label="진행률 초기화"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        )}
      </div>

      {/* 확인 모달 */}
      {showConfirm && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/95 rounded-lg z-10">
          <div className="text-center p-4">
            <p className="text-sm text-white mb-3">진행률을 초기화할까요?</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-3 py-1.5 text-xs text-text-secondary hover:text-white transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleReset}
                className="px-3 py-1.5 text-xs bg-error/20 text-error hover:bg-error/30 rounded-lg transition-colors"
              >
                초기화
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
