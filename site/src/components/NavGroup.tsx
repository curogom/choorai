import { useState, useEffect, useRef } from 'react';

interface NavItem {
  label: string;
  href?: string;
  badge?: string;
  tags?: string[];
  indent?: number;
}

interface NavGroupProps {
  title: string;
  items: NavItem[];
  currentPath?: string;
  storageKey: string;
  idPrefix: 'desktop' | 'mobile';
}

export default function NavGroup({
  title,
  items,
  currentPath,
  storageKey,
  idPrefix,
}: NavGroupProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const contentId = `nav-group-${idPrefix}-${storageKey.replace(/[^A-Za-z0-9_-]/g, '-')}`;

  // 현재 경로가 이 그룹에 있는지 확인
  const hasActiveItem = currentPath && items.some(item =>
    item.href && (currentPath === item.href || currentPath?.startsWith(item.href + '/'))
  );

  // localStorage에서 상태 복원
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`nav-group-${storageKey}`);
      if (saved !== null) {
        setIsOpen(saved === 'true');
      } else if (hasActiveItem) {
        setIsOpen(true);
      }
    }
  }, [storageKey, hasActiveItem]);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`nav-group-${storageKey}`, String(newState));
    }
  };

  useEffect(() => {
    if (!isOpen || !contentRef.current) return;

    const element = contentRef.current;
    const updateHeight = () => {
      setContentHeight(element.scrollHeight);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);

    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);

    return () => {
      window.removeEventListener('resize', updateHeight);
      observer.disconnect();
    };
  }, [isOpen, items]);

  return (
    <div className="pt-4 first:pt-0">
      <button
        onClick={handleToggle}
        className={`
          w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm font-semibold
          transition-colors cursor-pointer
          ${hasActiveItem
            ? 'text-primary'
            : 'text-text-secondary hover:text-white'
          }
        `}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <span>{title}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        id={contentId}
        ref={contentRef}
        hidden={!isOpen}
        aria-hidden={!isOpen}
        className="overflow-hidden transition-all duration-200 ease-in-out"
        style={{
          maxHeight: isOpen ? (contentHeight ? `${contentHeight}px` : 'none') : '0px',
          opacity: isOpen ? 1 : 0,
        }}
      >
        <ul className="mt-1 space-y-0.5">
          {items.map((item, idx) => (
            item.href ? (
              <li key={idx}>
                <a
                  href={item.href}
                  className={`
                    flex items-center justify-between py-1.5 rounded-lg text-sm font-medium
                    transition-colors pr-3
                    ${item.indent === 2 ? 'pl-9 text-xs' : item.indent === 1 ? 'pl-6' : 'pl-3'}
                    ${currentPath === item.href || currentPath?.startsWith(item.href + '/')
                      ? 'bg-primary/10 text-primary border-l-2 border-primary -ml-[1px]'
                      : 'text-text-secondary hover:text-white hover:bg-surface'
                    }
                  `}
                  aria-current={currentPath === item.href ? 'page' : undefined}
                >
                  <span>{item.label}</span>
                  <span className="flex items-center gap-1">
                    {item.tags?.map((tag, i) => (
                      <span key={i} className="text-xs leading-none" title={tag === '🌱' ? '입문' : tag === '👍' ? '추천' : tag}>
                        {tag}
                      </span>
                    ))}
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-primary/20 text-primary rounded">
                        {item.badge}
                      </span>
                    )}
                  </span>
                </a>
              </li>
            ) : (
              <li key={idx}>
                {/*
                  indent 1 + no badge/tag 항목은 섹션 헤더처럼 보여주고,
                  나머지 no href 항목은 기존처럼 비활성 표시합니다.
                */}
                <span
                  className={`
                    flex items-center justify-between py-1.5 rounded-lg text-sm font-medium pr-3
                    ${item.indent === 2 ? 'pl-9 text-xs' : item.indent === 1 ? 'pl-6' : 'pl-3'}
                    ${item.indent === 1 && !item.badge && !item.tags?.length
                      ? 'text-text-secondary font-semibold cursor-default'
                      : 'text-text-secondary/50 cursor-not-allowed'
                    }
                  `}
                >
                  <span>{item.label}</span>
                  <span className="flex items-center gap-1">
                    {item.tags?.map((tag, i) => (
                      <span key={i} className="text-xs leading-none opacity-50">
                        {tag}
                      </span>
                    ))}
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-surface text-text-secondary/60 rounded">
                        {item.badge}
                      </span>
                    )}
                  </span>
                </span>
              </li>
            )
          ))}
        </ul>
      </div>
    </div>
  );
}
