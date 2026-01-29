import { useState } from 'react';

interface PromptBoxProps {
  prompt: string;
  title?: string;
  description?: string;
  actionLabel?: string;
}

export default function PromptBox({
  prompt,
  title = 'AI 프롬프트',
  description = '위 프롬프트를 복사하여 AI 채팅에 붙여넣으세요.',
  actionLabel = '프롬프트 복사',
}: PromptBoxProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div
      className="
        group relative overflow-hidden rounded-xl
        border border-accent-purple/40
        bg-gradient-to-br from-accent-purple/10 to-transparent
        p-6 md:p-8
      "
    >
      {/* 배경 장식 */}
      <div className="absolute top-0 right-0 p-4 opacity-50">
        <svg
          className="w-20 h-20 text-accent-purple opacity-20 rotate-12"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col gap-6">
        {/* 헤더 */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent-purple text-white shadow-lg shadow-accent-purple/20">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-white text-xl font-bold">{title}</h3>
            <p className="text-accent-purple font-medium text-sm">작업 필요</p>
          </div>
        </div>

        {/* 프롬프트 내용 */}
        <div className="bg-background/80 rounded-lg border border-accent-purple/30 p-4 md:p-6 backdrop-blur-sm">
          <p className="text-slate-200 font-medium leading-relaxed font-mono text-sm md:text-base">
            "{prompt}"
          </p>
        </div>

        {/* 액션 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-text-secondary text-sm">{description}</p>
          <button
            onClick={handleCopy}
            className="
              flex items-center gap-2
              bg-accent-purple hover:bg-accent-purple-hover
              text-white px-5 py-2.5 rounded-lg
              font-bold text-sm transition-all hover:scale-105
              shadow-lg shadow-accent-purple/20
            "
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                복사됨!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                {actionLabel}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
