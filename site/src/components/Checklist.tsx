import { useState, useEffect } from 'react';
import { notifyProgressChange } from '../lib/progressStore';

interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
}

interface ChecklistProps {
  items: ChecklistItem[];
  storageKey: string;
  title?: string;
  locale?: 'ko' | 'en';
  onAllComplete?: () => void;
}

const labels = {
  ko: {
    title: '완료 체크리스트', done: '완료', progress: '진행률', allDone: '모든 항목을 완료했습니다!',
    readFailed: '저장된 체크를 읽지 못했습니다. 현재 체크 상태는 유지했습니다.',
    saveFailed: '체크는 이 탭에 남아 있지만 브라우저에 저장하지 못했습니다. 새로고침하면 사라질 수 있습니다.',
    saved: '체크를 이 브라우저에 저장했습니다.',
    cleared: '다른 탭에서 브라우저 저장 자료가 지워졌습니다. 현재 체크는 이 탭에 유지됩니다.',
  },
  en: {
    title: 'Completion Checklist', done: 'done', progress: 'Progress', allDone: 'All items completed!',
    readFailed: 'Saved checklist data could not be read. Current checks were kept.',
    saveFailed: 'The check remains in this tab, but the browser could not save it. Refreshing may lose it.',
    saved: 'Checklist saved in this browser.',
    cleared: 'Browser data was cleared in another tab. Current checks remain in this tab.',
  },
};

export default function Checklist({
  items,
  storageKey,
  title,
  locale,
  onAllComplete,
}: ChecklistProps) {
  const l = labels[locale || 'ko'];
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [showCelebration, setShowCelebration] = useState(false);
  const [storageMessage, setStorageMessage] = useState('');

  // localStorage에서 상태 로드
  useEffect(() => {
    const load = () => {
      const keys = storageKey === 'mission-2week-v2'
        ? [storageKey, 'mission-2week-v2-en'] : [storageKey];
      const ids = new Set<string>();
      try {
        for (const key of keys) {
          const parsed = JSON.parse(localStorage.getItem(`checklist-${key}`) || '[]');
          if (Array.isArray(parsed)) parsed.forEach((id) => {
            if (items.some((item) => item.id === id)) ids.add(id);
          });
        }
        setChecked(ids);
      } catch {
        setStorageMessage(l.readFailed);
      }
    };
    load();
    const handleStorage = (event: StorageEvent) => {
      if (event.key === null) { setStorageMessage(l.cleared); return; }
      if (event.key === `checklist-${storageKey}` ||
          (storageKey === 'mission-2week-v2' && event.key === 'checklist-mission-2week-v2-en')) load();
    };
    window.addEventListener('storage', handleStorage);
    if (storageKey.startsWith('60min')) window.addEventListener('60min-progress-change', load);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('60min-progress-change', load);
    };
  }, [storageKey, l.cleared, l.readFailed]);

  // 완료 상태에 따른 축하 효과 (읽기 시 저장하지 않음)
  useEffect(() => {
    // 모두 완료 시 축하 효과
    if (checked.size === items.length && items.length > 0) {
      setShowCelebration(true);
      onAllComplete?.();
      setTimeout(() => setShowCelebration(false), 3000);
    }
  }, [checked, storageKey, items.length, onAllComplete]);

  const toggleItem = (id: string) => {
    const next = new Set(checked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setChecked(next);
    try {
      localStorage.setItem(`checklist-${storageKey}`, JSON.stringify([...next]));
      if (storageKey === 'mission-2week-v2') localStorage.removeItem('checklist-mission-2week-v2-en');
      setStorageMessage(l.saved);
      if (storageKey.startsWith('60min')) notifyProgressChange();
    } catch {
      setStorageMessage(l.saveFailed);
    }
  };

  const progress = items.length > 0 ? Math.round((checked.size / items.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-white text-lg font-bold">{title ?? l.title}</h3>
        <span className="text-text-secondary text-sm">
          {checked.size}/{items.length} {l.done}
        </span>
      </div>
      {storageMessage && <p role="status" aria-live="polite" className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-100">{storageMessage}</p>}

      {/* 진행률 바 */}
      <div
        className="h-1.5 w-full bg-border rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${l.progress} ${progress}%`}
      >
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 체크리스트 */}
      <div className="bg-surface/50 rounded-xl border border-border divide-y divide-border">
        {items.map((item) => (
          <label
            key={item.id}
            className="flex items-start gap-4 p-4 hover:bg-surface cursor-pointer transition-colors group"
          >
            <div className="relative flex items-center pt-0.5">
              <input
                type="checkbox"
                checked={checked.has(item.id)}
                onChange={() => toggleItem(item.id)}
                className="
                  peer w-6 h-6 rounded border-2 border-text-secondary
                  bg-transparent cursor-pointer appearance-none
                  checked:border-primary checked:bg-primary
                  focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background
                  transition-colors
                "
              />
              {/* 체크 아이콘 */}
              <svg
                className={`
                  absolute left-1 top-1.5 w-4 h-4 text-background
                  transition-opacity
                  ${checked.has(item.id) ? 'opacity-100' : 'opacity-0'}
                `}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex flex-col gap-1">
              <span
                className={`
                  font-medium transition-colors
                  ${checked.has(item.id)
                    ? 'text-text-secondary line-through'
                    : 'text-white group-hover:text-primary'
                  }
                `}
              >
                {item.label}
              </span>
              {item.description && (
                <span className="text-text-secondary text-sm">{item.description}</span>
              )}
            </div>
          </label>
        ))}
      </div>

      {/* 축하 메시지 */}
      {showCelebration && (
        <div className="flex items-center justify-center gap-2 p-4 bg-success/10 border border-success/30 rounded-lg text-success animate-fade-in-up" role="alert">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span className="font-bold">{l.allDone}</span>
        </div>
      )}
    </div>
  );
}
