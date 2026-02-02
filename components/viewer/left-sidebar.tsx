'use client';

import { Box, Layers, Play, Wrench, X } from 'lucide-react';

import type { Model, ModelPart } from '@/lib/types';
import { cn } from '@/lib/utils';

import { ExplodeSlider } from './explode-slider';
import { PartThumbnail } from './part-thumbnail';

interface LeftSidebarProps {
  model: Model;
  selectedPartId: string | null;
  explodeValue: number;
  onExplodeChange: (value: number) => void;
  onPartSelect: (partId: string | null) => void;
}

const tabs = [
  { id: 'single', label: '단일부품', icon: Box },
  { id: 'assembly', label: '조립도', icon: Layers },
  { id: 'edit', label: '편집', icon: Wrench },
  { id: 'simulate', label: '시뮬레이터', icon: Play },
];

export function LeftSidebar({
  model,
  selectedPartId,
  explodeValue,
  onExplodeChange,
  onPartSelect,
}: LeftSidebarProps) {
  const selectedPart = model.parts.find((p) => p.id === selectedPartId);

  return (
    <aside className="w-[220px] h-full bg-card/80 backdrop-blur-sm border-r border-border flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-border">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            className={cn(
              'flex-1 py-2 text-xs transition-colors relative',
              index === 1
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <tab.icon className="w-3.5 h-3.5 mx-auto" />
            {index === 1 && (
              <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Model Info Card */}
      <div className="p-3 border-b border-border">
        <div className="glass-panel p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-foreground truncate">
              {model.nameKo}
            </h3>
            <button
              onClick={() => onPartSelect(null)}
              className="p-1 rounded hover:bg-secondary transition-colors"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>

          {/* Parts thumbnail grid - 3D model previews */}
          <div className="grid grid-cols-2 gap-2">
            {model.parts.slice(0, 4).map((part) => (
              <PartThumbnail
                key={part.id}
                part={part}
                isSelected={selectedPartId === part.id}
                onClick={() => onPartSelect(part.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Parts List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {model.parts.map((part) => (
          <PartItem
            key={part.id}
            part={part}
            isSelected={selectedPartId === part.id}
            onClick={() => onPartSelect(part.id)}
          />
        ))}
      </div>

      {/* Explode Slider */}
      <div className="p-3 border-t border-border">
        <ExplodeSlider value={explodeValue} onChange={onExplodeChange} />
      </div>
    </aside>
  );
}

interface PartItemProps {
  part: ModelPart;
  isSelected: boolean;
  onClick: () => void;
}

function PartItem({ part, isSelected, onClick }: PartItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-2 rounded-lg transition-all',
        'hover:bg-secondary/50',
        isSelected && 'bg-primary/10 border border-primary/30'
      )}
    >
      <h4
        className={cn(
          'text-sm font-medium mb-1',
          isSelected ? 'text-primary' : 'text-foreground'
        )}
      >
        {part.nameKo}
      </h4>
      <p className="text-xs text-muted-foreground line-clamp-2">{part.role}</p>
    </button>
  );
}
