import { useState } from 'react';

type Severity = 'critical' | 'warning' | 'info';

interface ErrorCardProps {
  errorMessage: string;
  errorCode?: string;
  severity?: Severity;
  cause: string;
  solution?: string | string[];
  solutionCode?: string;
  aiPrompt?: string;
}

const severityConfig: Record<Severity, { label: string; bgClass: string; textClass: string }> = {
  critical: {
    label: '심각',
    bgClass: 'bg-error/20',
    textClass: 'text-error',
  },
  warning: {
    label: '주의',
    bgClass: 'bg-warning/20',
    textClass: 'text-warning',
  },
  info: {
    label: '정보',
    bgClass: 'bg-primary/20',
    textClass: 'text-primary',
  },
};

export default function ErrorCard({
  errorMessage,
  errorCode,
  severity = 'critical',
  cause,
  solution,
  solutionCode,
  aiPrompt,
}: ErrorCardProps) {
  const [copied, setCopied] = useState<'solution' | 'ai' | null>(null);
  const config = severityConfig[severity];

  const handleCopy = async (text: string, type: 'solution' | 'ai') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const solutionSteps = solution ? (Array.isArray(solution) ? solution : [solution]) : [];

  return (
    <div className="flex flex-col bg-surface rounded-xl border border-border overflow-hidden shadow-lg hover:border-border-focus/50 transition-colors">
      {/* 본문 */}
      <div className="flex flex-col gap-4 p-6 border-l-4 border-l-error">
        {/* 헤더 */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${config.bgClass} ${config.textClass}`}>
              {config.label}
            </span>
            {errorCode && (
              <span className="text-text-secondary text-xs font-mono">코드: {errorCode}</span>
            )}
          </div>
          <h3 className="text-error text-lg font-bold font-mono tracking-tight break-all">
            {errorMessage}
          </h3>
        </div>

        {/* 원인 & 해결책 */}
        <div className="grid md:grid-cols-[1fr_2fr] gap-6 mt-2">
          {/* 원인 */}
          <div className="flex flex-col gap-2">
            <span className="text-white font-semibold text-sm flex items-center gap-2">
              <svg className="w-4 h-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              원인
            </span>
            <p className="text-text-secondary text-sm leading-relaxed">{cause}</p>
          </div>

          {/* 해결책 */}
          <div className="flex flex-col gap-2">
            <span className="text-white font-semibold text-sm flex items-center gap-2">
              <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              해결책
            </span>

            {solutionCode ? (
              <div className="bg-background rounded-lg p-3 border border-border font-mono text-xs text-success overflow-x-auto">
                <code>{solutionCode}</code>
              </div>
            ) : (
              <ol className="list-decimal list-inside text-text-secondary text-sm space-y-1">
                {solutionSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>

      {/* 액션 바 */}
      <div className="bg-background/50 px-6 py-3 flex justify-between items-center border-t border-border">
        <button
          onClick={() => handleCopy(solutionCode || solutionSteps.join('\n'), 'solution')}
          className="text-text-secondary hover:text-white text-sm font-medium flex items-center gap-2 transition-colors"
        >
          {copied === 'solution' ? (
            <>
              <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              복사됨!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              해결책 복사
            </>
          )}
        </button>

        {aiPrompt && (
          <button
            onClick={() => handleCopy(aiPrompt, 'ai')}
            className="
              bg-gradient-to-r from-accent-purple to-primary
              hover:from-accent-purple-hover hover:to-primary-hover
              text-white text-sm font-bold py-2 px-4 rounded-lg
              flex items-center gap-2 shadow-lg shadow-accent-purple/20
              transition-all transform active:scale-95
            "
          >
            {copied === 'ai' ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                복사됨!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI에게 물어보기
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
