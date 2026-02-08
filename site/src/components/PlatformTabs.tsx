import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

interface PlatformTabItem {
  id: string;
  label: string;
  summary: string;
  commands?: string;
  notes?: string[];
}

interface PlatformTabsProps {
  title?: string;
  tabs: PlatformTabItem[];
}

const STORAGE_KEY = 'choorai-platform';

export default function PlatformTabs({ title = 'OS 선택', tabs }: PlatformTabsProps) {
  const groupId = useId();
  const defaultId = tabs[0]?.id ?? 'mac';
  const [active, setActive] = useState<string>(defaultId);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && tabs.some((tab) => tab.id === saved)) {
      setActive(saved);
    }
  }, [tabs]);

  const onSelect = (id: string) => {
    setActive(id);
    localStorage.setItem(STORAGE_KEY, id);
  };

  const onKeyDown = (index: number, event: KeyboardEvent<HTMLButtonElement>) => {
    if (tabs.length === 0) return;

    let nextIndex = index;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = tabs.length - 1;

    if (nextIndex !== index) {
      event.preventDefault();
      const nextTab = tabs[nextIndex];
      if (!nextTab) return;
      onSelect(nextTab.id);
      tabRefs.current[nextIndex]?.focus();
    }
  };

  const current = useMemo(
    () => tabs.find((tab) => tab.id === active) ?? tabs[0],
    [active, tabs],
  );

  if (!current) return null;

  return (
    <div className="p-4 bg-surface border border-border rounded-xl my-6">
      <p className="text-sm text-text-secondary mb-3">{title}</p>
      <div className="flex flex-wrap gap-2 mb-4" role="tablist" aria-label={title}>
        {tabs.map((tab, index) => {
          const selected = tab.id === current.id;
          const tabId = `${groupId}-tab-${tab.id}`;
          const panelId = `${groupId}-panel-${tab.id}`;
          return (
            <button
              key={tab.id}
              type="button"
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              onClick={() => onSelect(tab.id)}
              onKeyDown={(event) => onKeyDown(index, event)}
              role="tab"
              id={tabId}
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                selected
                  ? 'bg-primary/20 border-primary/40 text-primary'
                  : 'bg-surface-elevated border-border text-text-secondary hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        className="space-y-3"
        role="tabpanel"
        id={`${groupId}-panel-${current.id}`}
        aria-labelledby={`${groupId}-tab-${current.id}`}
      >
        <p className="text-sm text-text-secondary">{current.summary}</p>
        {current.commands && (
          <pre className="bg-background border border-border rounded-lg p-3 overflow-x-auto text-xs text-green-400">
            <code>{current.commands}</code>
          </pre>
        )}
        {current.notes && current.notes.length > 0 && (
          <ul className="list-disc list-inside text-xs text-text-secondary space-y-1">
            {current.notes.map((note, idx) => (
              <li key={`${current.id}-${idx}`}>{note}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
