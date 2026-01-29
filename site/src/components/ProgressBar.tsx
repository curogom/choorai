interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  sublabel?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
};

export default function ProgressBar({
  value,
  label,
  sublabel,
  showPercentage = true,
  size = 'md',
  glow = true,
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className="w-full">
      {/* 라벨 영역 */}
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            {label && (
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
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
                  {sublabel && <p className="text-xs text-text-secondary">{sublabel}</p>}
                </div>
              </div>
            )}
          </div>
          {showPercentage && (
            <span className="text-2xl font-black text-primary">{clampedValue}%</span>
          )}
        </div>
      )}

      {/* 프로그레스 바 */}
      <div className={`w-full bg-border rounded-full overflow-hidden ${sizeStyles[size]}`}>
        <div
          className={`
            h-full rounded-full transition-all duration-500 ease-out
            bg-gradient-to-r from-primary-dark to-primary
            ${glow ? 'shadow-[0_0_10px_rgba(87,171,255,0.8)]' : ''}
          `}
          style={{ width: `${clampedValue}%` }}
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {/* 하단 힌트 */}
      {clampedValue === 0 && (
        <p className="text-xs text-text-secondary text-left mt-2 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          지금 시작하면 60분 뒤 100% 달성 가능
        </p>
      )}
    </div>
  );
}
