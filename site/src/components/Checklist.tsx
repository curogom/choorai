import { useState, useEffect } from 'react';

interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
}

interface ChecklistProps {
  items: ChecklistItem[];
  storageKey: string;
  title?: string;
  onAllComplete?: () => void;
}

export default function Checklist({
  items,
  storageKey,
  title = '완료 체크리스트',
  onAllComplete,
}: ChecklistProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [showCelebration, setShowCelebration] = useState(false);

  // localStorage에서 상태 로드
  useEffect(() => {
    const saved = localStorage.getItem(`checklist-${storageKey}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setChecked(new Set(parsed));
      } catch {
        // 파싱 실패 시 무시
      }
    }
  }, [storageKey]);

  // 상태 변경 시 localStorage 저장
  useEffect(() => {
    localStorage.setItem(`checklist-${storageKey}`, JSON.stringify([...checked]));

    // 모두 완료 시 축하 효과
    if (checked.size === items.length && items.length > 0) {
      setShowCelebration(true);
      onAllComplete?.();
      setTimeout(() => setShowCelebration(false), 3000);
    }
  }, [checked, storageKey, items.length, onAllComplete]);

  const toggleItem = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const progress = items.length > 0 ? Math.round((checked.size / items.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-white text-lg font-bold">{title}</h3>
        <span className="text-text-secondary text-sm">
          {checked.size}/{items.length} 완료
        </span>
      </div>

      {/* 진행률 바 */}
      <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
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
                  bg-transparent text-primary cursor-pointer
                  checked:border-primary checked:bg-primary
                  focus:ring-0 focus:ring-offset-0
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
        <div className="flex items-center justify-center gap-2 p-4 bg-success/10 border border-success/30 rounded-lg text-success animate-fade-in-up">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span className="font-bold">모든 항목을 완료했습니다!</span>
        </div>
      )}
    </div>
  );
}
