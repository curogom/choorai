import { useState, useEffect } from 'react';

interface NavItem {
  label: string;
  href?: string;
  badge?: string;
  indent?: number;
}

interface NavGroupProps {
  title: string;
  items: NavItem[];
  currentPath?: string;
  storageKey: string;
}

export default function NavGroup({
  title,
  items,
  currentPath,
  storageKey,
}: NavGroupProps) {
  const [isOpen, setIsOpen] = useState(true);

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
        className={`
          overflow-hidden transition-all duration-200 ease-in-out
          ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
        `}
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
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-primary/20 text-primary rounded">
                      {item.badge}
                    </span>
                  )}
                </a>
              </li>
            ) : (
              <li key={idx}>
                <span
                  className={`
                    flex items-center justify-between py-1.5 rounded-lg text-sm font-medium pr-3
                    ${item.indent === 2 ? 'pl-9 text-xs' : item.indent === 1 ? 'pl-6' : 'pl-3'}
                    text-text-secondary/50 cursor-not-allowed
                  `}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-surface text-text-secondary/60 rounded">
                      {item.badge}
                    </span>
                  )}
                </span>
              </li>
            )
          ))}
        </ul>
      </div>
    </div>
  );
}
