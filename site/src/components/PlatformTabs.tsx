import { useEffect, useMemo, useState } from 'react';

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
  const defaultId = tabs[0]?.id ?? 'mac';
  const [active, setActive] = useState<string>(defaultId);

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

  const current = useMemo(
    () => tabs.find((tab) => tab.id === active) ?? tabs[0],
    [active, tabs],
  );

  if (!current) return null;

  return (
    <div className="p-4 bg-surface border border-border rounded-xl my-6">
      <p className="text-sm text-text-secondary mb-3">{title}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map((tab) => {
          const selected = tab.id === current.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelect(tab.id)}
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

      <div className="space-y-3">
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
