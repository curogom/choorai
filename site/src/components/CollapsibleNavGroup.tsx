import { useState, useEffect } from 'react';

interface NavItem {
  label: string;
  href: string;
  badge?: string;
  description?: string;
}

interface CollapsibleNavGroupProps {
  title: string;
  icon?: string;
  items: NavItem[];
  currentPath?: string;
  defaultOpen?: boolean;
  storageKey?: string;
}

export default function CollapsibleNavGroup({
  title,
  icon,
  items,
  currentPath,
  defaultOpen = false,
  storageKey,
}: CollapsibleNavGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // localStorage에서 상태 복원
  useEffect(() => {
    if (storageKey && typeof window !== 'undefined') {
      const saved = localStorage.getItem(`nav-${storageKey}`);
      if (saved !== null) {
        setIsOpen(saved === 'true');
      } else if (currentPath && items.some(item => item.href === currentPath)) {
        // 현재 경로가 이 그룹에 있으면 자동으로 열기
        setIsOpen(true);
      }
    }
  }, [storageKey, currentPath, items]);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (storageKey && typeof window !== 'undefined') {
      localStorage.setItem(`nav-${storageKey}`, String(newState));
    }
  };

  const hasActiveItem = currentPath && items.some(item => item.href === currentPath);

  return (
    <div className="ml-3 mt-1">
      <button
        onClick={handleToggle}
        className={`
          w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm font-medium
          transition-colors cursor-pointer
          ${hasActiveItem
            ? 'text-primary bg-primary/5'
            : 'text-text-secondary hover:text-white hover:bg-surface'
          }
        `}
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          {icon && <span className="text-xs">{icon}</span>}
          <span>{title}</span>
        </span>
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
          ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <ul className="mt-1 ml-2 space-y-0.5 border-l border-border/50 pl-2">
          {items.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className={`
                  flex items-center justify-between px-2 py-1.5 rounded-md text-sm
                  transition-colors
                  ${currentPath === item.href
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-text-secondary hover:text-white hover:bg-surface/50'
                  }
                `}
              >
                <span className="flex flex-col">
                  <span>{item.label}</span>
                  {item.description && (
                    <span className="text-[10px] text-text-secondary/70">{item.description}</span>
                  )}
                </span>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-primary/20 text-primary rounded">
                    {item.badge}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
