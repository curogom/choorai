import { useState } from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
}

export default function CodeBlock({
  code,
  language: _language = 'typescript',
  filename,
  showLineNumbers = false,
}: CodeBlockProps) {
  // Note: language prop reserved for future syntax highlighting integration
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const lines = code.split('\n');

  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden shadow-xl">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
        <div className="flex items-center gap-2">
          {/* 트래픽 라이트 */}
          <span className="w-3 h-3 rounded-full bg-red-500/80" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <span className="w-3 h-3 rounded-full bg-green-500/80" />
          {filename && (
            <span className="ml-2 text-xs font-mono text-text-secondary">{filename}</span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="text-text-secondary hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider"
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
              복사
            </>
          )}
        </button>
      </div>

      {/* 코드 영역 */}
      <div className="p-4 md:p-6 overflow-x-auto">
        <pre className="text-sm leading-relaxed">
          <code className="font-mono">
            {showLineNumbers
              ? lines.map((line, i) => (
                  <div key={i} className="flex">
                    <span className="select-none text-text-muted w-8 text-right pr-4">
                      {i + 1}
                    </span>
                    <span className="text-text-primary">{line}</span>
                  </div>
                ))
              : code}
          </code>
        </pre>
      </div>
    </div>
  );
}
