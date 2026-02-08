import { useState, useEffect } from 'react';
import { MAP_NODES } from '../data/mapNodes';
import { getCompletedMapNodes, getMapNodeStatus, type MapNodeStatus } from '../lib/progressStore';
import { useLearningMode } from './ModeToggle';

interface MiniMapProps {
  locale?: string;
  currentNodeId?: string;
  showModeToggle?: boolean;
  size?: 'sm' | 'md';
  onNodeClick?: (nodeId: string, href: string) => void;
}

export default function MiniMap({
  locale = 'ko',
  currentNodeId,
  showModeToggle = false,
  size = 'md',
  onNodeClick,
}: MiniMapProps) {
  const isEn = locale === 'en';
  const { mode } = useLearningMode();
  const [completedNodes, setCompletedNodes] = useState<string[]>([]);

  useEffect(() => {
    setCompletedNodes(getCompletedMapNodes());

    const handleProgressChange = () => {
      setCompletedNodes(getCompletedMapNodes());
    };

    window.addEventListener('map-progress-change', handleProgressChange);
    window.addEventListener('storage', handleProgressChange);
    return () => {
      window.removeEventListener('map-progress-change', handleProgressChange);
      window.removeEventListener('storage', handleProgressChange);
    };
  }, []);

  const isSmall = size === 'sm';

  // Row 기반 노드 분류 (Step 1-4, Step 5-8)
  // Row 1은 역순으로 정렬 (뱀 형태 레이아웃)
  const row0Nodes = MAP_NODES.filter((n) => n.row === 0).sort((a, b) => a.order - b.order);
  const row1Nodes = MAP_NODES.filter((n) => n.row === 1).sort((a, b) => b.order - a.order);

  const getNodeStatus = (nodeId: string, order: number): MapNodeStatus => {
    if (currentNodeId === nodeId) return 'current';
    return getMapNodeStatus(nodeId, order, mode);
  };

  const handleNodeClick = (nodeId: string, href: string, status: MapNodeStatus) => {
    if (status === 'locked') return;
    if (onNodeClick) {
      onNodeClick(nodeId, href);
    } else {
      window.location.href = href;
    }
  };

  return (
    <div className={`${isSmall ? 'p-3' : 'p-4'} bg-surface rounded-xl border border-border`}>
      {/* Row 0: Step 1-4 */}
      <div className="flex items-center justify-center gap-1 mb-2">
        {row0Nodes.map((node, idx) => {
          const status = getNodeStatus(node.id, node.order);
          return (
            <div key={node.id} className="flex items-center">
              <MapNodeButton
                node={node}
                status={status}
                size={size}
                locale={locale}
                onClick={() => handleNodeClick(node.id, node.href, status)}
              />
              {idx < row0Nodes.length - 1 && (
                <span className={`${isSmall ? 'text-xs px-0.5' : 'text-sm px-1'} text-primary font-bold`}>→</span>
              )}
            </div>
          );
        })}
      </div>

      {/* 연결선 */}
      <div className="flex justify-end pr-6 mb-1">
        <div className="flex flex-col items-center">
          <div className="w-0.5 h-2 bg-primary" />
          <span className={`${isSmall ? 'text-[10px]' : 'text-xs'} text-primary font-bold leading-none`}>↓</span>
        </div>
      </div>

      {/* Row 1: Step 8-5 (역순, 뱀 형태) */}
      <div className="flex items-center justify-center gap-1">
        {row1Nodes.map((node, idx) => {
          const status = getNodeStatus(node.id, node.order);
          return (
            <div key={node.id} className="flex items-center">
              <MapNodeButton
                node={node}
                status={status}
                size={size}
                locale={locale}
                onClick={() => handleNodeClick(node.id, node.href, status)}
              />
              {idx < row1Nodes.length - 1 && (
                <span className={`${isSmall ? 'text-xs px-0.5' : 'text-sm px-1'} text-primary font-bold`}>←</span>
              )}
            </div>
          );
        })}
      </div>

      {/* 진행률 + 모드 토글 */}
      {showModeToggle && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <span className="text-xs text-text-secondary">
            {completedNodes.length}/{MAP_NODES.length} {isEn ? 'done' : '완료'}
          </span>
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => {
                const event = new CustomEvent('learning-mode-change', {
                  detail: mode === 'guided' ? 'explore' : 'guided',
                });
                window.dispatchEvent(event);
                localStorage.setItem(
                  'choorai-learning-mode',
                  mode === 'guided' ? 'explore' : 'guided'
                );
              }}
              className="flex items-center gap-1 text-text-secondary hover:text-white transition-colors"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${mode === 'guided' ? 'bg-primary' : 'bg-text-muted'}`}
              />
              <span className={mode === 'guided' ? 'text-primary' : ''}>Guided</span>
              <span className="mx-1 text-text-muted">|</span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${mode === 'explore' ? 'bg-primary' : 'bg-text-muted'}`}
              />
              <span className={mode === 'explore' ? 'text-primary' : ''}>Explore</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface MapNodeButtonProps {
  node: (typeof MAP_NODES)[0];
  status: MapNodeStatus;
  size: 'sm' | 'md';
  locale?: string;
  onClick: () => void;
}

function MapNodeButton({ node, status, size, locale = 'ko', onClick }: MapNodeButtonProps) {
  const isSmall = size === 'sm';
  const isLocked = status === 'locked';
  const isCurrent = status === 'current';
  const isCompleted = status === 'completed';
  const isEn = locale === 'en';

  const getShortLabel = (id: string, title: string): string => {
    const labelMap: Record<string, Record<string, string>> = {
      ko: { dns: '도메인', database: 'DB', frontend: 'Front', backend: 'Back', runtime: 'Env', ops: '모니터링', docker: 'Docker', cicd: 'CI/CD' },
      en: { dns: 'Domain', database: 'DB', frontend: 'Front', backend: 'Back', runtime: 'Env', ops: 'Monitor', docker: 'Docker', cicd: 'CI/CD' },
    };
    const map = labelMap[isEn ? 'en' : 'ko'];
    return map[id] || title.split(' ')[0];
  };

  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={`
        relative flex flex-col items-center justify-center rounded-lg transition-all
        ${isLocked
          ? 'bg-surface-elevated border border-border text-text-muted cursor-not-allowed opacity-50'
          : isCompleted
            ? 'bg-success/20 border border-success/50 text-success'
            : isCurrent
              ? 'bg-primary/20 border-2 border-primary text-primary animate-pulse'
              : 'bg-surface-elevated border border-border text-text-secondary hover:border-primary/50 hover:text-white'
        }
      `}
      style={{
        width: isSmall ? '44px' : '52px',
        height: isSmall ? '44px' : '52px',
      }}
      title={`Step ${node.order}: ${isEn ? (node.titleEn || node.title) : node.title}${isLocked ? (isEn ? ' (Locked)' : ' (잠김)') : ''}`}
    >
      {/* 아이콘 또는 체크/잠금 */}
      <span className={isSmall ? 'text-sm' : 'text-base'}>
        {isCompleted ? '✓' : isLocked ? '🔒' : node.icon}
      </span>
      {/* 짧은 라벨 */}
      <span
        className={`${isSmall ? 'text-[7px]' : 'text-[9px]'} font-medium mt-0.5 truncate max-w-full px-0.5`}
      >
        {getShortLabel(node.id, node.title)}
      </span>
    </button>
  );
}

// Hook for map progress
export function useMapProgress() {
  const [completedNodes, setCompletedNodes] = useState<string[]>([]);

  useEffect(() => {
    setCompletedNodes(getCompletedMapNodes());

    const handleProgressChange = () => {
      setCompletedNodes(getCompletedMapNodes());
    };

    window.addEventListener('map-progress-change', handleProgressChange);
    window.addEventListener('storage', handleProgressChange);
    return () => {
      window.removeEventListener('map-progress-change', handleProgressChange);
      window.removeEventListener('storage', handleProgressChange);
    };
  }, []);

  const progress = Math.round((completedNodes.length / MAP_NODES.length) * 100);

  return { completedNodes, totalNodes: MAP_NODES.length, progress };
}
