import type { ReactNode } from 'react';

type CalloutVariant = 'info' | 'warning' | 'error' | 'success' | 'tip';

interface CalloutProps {
  variant?: CalloutVariant;
  title?: string;
  locale?: 'ko' | 'en';
  children: ReactNode;
}

const defaultTitles = {
  ko: { info: '정보', warning: '주의', error: '오류', success: '완료', tip: '꿀팁' },
  en: { info: 'Info', warning: 'Warning', error: 'Error', success: 'Done', tip: 'Tip' },
};

const variantConfig: Record<CalloutVariant, {
  bgClass: string;
  borderClass: string;
  iconClass: string;
  titleClass: string;
  icon: ReactNode;
  defaultTitle: string;
}> = {
  info: {
    bgClass: 'bg-primary/10',
    borderClass: 'border-primary/30',
    iconClass: 'text-primary',
    titleClass: 'text-primary',
    defaultTitle: '정보',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  warning: {
    bgClass: 'bg-warning/10',
    borderClass: 'border-warning/30',
    iconClass: 'text-warning',
    titleClass: 'text-warning',
    defaultTitle: '주의',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  error: {
    bgClass: 'bg-error/10',
    borderClass: 'border-error/30',
    iconClass: 'text-error',
    titleClass: 'text-error',
    defaultTitle: '오류',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  success: {
    bgClass: 'bg-success/10',
    borderClass: 'border-success/30',
    iconClass: 'text-success',
    titleClass: 'text-success',
    defaultTitle: '완료',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  tip: {
    bgClass: 'bg-accent-purple/10',
    borderClass: 'border-accent-purple/30',
    iconClass: 'text-accent-purple',
    titleClass: 'text-accent-purple',
    defaultTitle: '꿀팁',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
};

export default function Callout({
  variant = 'info',
  title,
  locale,
  children,
}: CalloutProps) {
  const config = variantConfig[variant];
  const displayTitle = title ?? defaultTitles[locale || 'ko'][variant];

  return (
    <div
      className={`
        rounded-lg border p-4
        ${config.bgClass} ${config.borderClass}
      `}
    >
      <div className="flex gap-3">
        <div className={`flex-shrink-0 ${config.iconClass}`}>
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-bold text-sm mb-1 ${config.titleClass}`}>
            {displayTitle}
          </p>
          <div className="text-text-secondary text-sm leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
