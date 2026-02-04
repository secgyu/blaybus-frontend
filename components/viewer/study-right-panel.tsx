'use client';

import { useEffect, useRef } from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Model, ModelPart } from '@/lib/types';
import { cn } from '@/lib/utils';

import { PartThumbnail } from './part-thumbnail';

interface StudyRightPanelProps {
  model: Model;
  selectedPartId: string | null;
  onPartSelect: (partId: string | null) => void;
}

export function StudyRightPanel({
  model,
  selectedPartId,
  onPartSelect,
}: StudyRightPanelProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const partRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const selectedPart = model.parts.find((p) => p.id === selectedPartId);

  useEffect(() => {
    if (selectedPartId && scrollContainerRef.current) {
      const partElement = partRefs.current.get(selectedPartId);
      if (partElement) {
        const container = scrollContainerRef.current;
        const containerRect = container.getBoundingClientRect();
        const elementRect = partElement.getBoundingClientRect();

        const scrollLeft =
          elementRect.left -
          containerRect.left +
          container.scrollLeft -
          containerRect.width / 2 +
          elementRect.width / 2;

        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth',
        });
      }
    }
  }, [selectedPartId]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -120, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 120, behavior: 'smooth' });
    }
  };

  return (
    <aside className="h-full bg-card/80 backdrop-blur-sm border-l border-border flex flex-col">
      <div className="p-3 border-b border-border flex-shrink-0">
        <h2 className="text-sm font-medium text-foreground">부품 목록</h2>
      </div>

      <div className="py-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={scrollLeft}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div
            ref={scrollContainerRef}
            className="flex-1 flex gap-4 overflow-x-auto scrollbar-hide py-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {model.parts.map((part) => {
              const isSelected = selectedPartId === part.id;
              return (
                <button
                  key={part.id}
                  ref={(el) => {
                    if (el) partRefs.current.set(part.id, el);
                  }}
                  onClick={() => onPartSelect(part.id)}
                  className="flex-shrink-0 flex flex-col items-center gap-2 group"
                >
                  <div
                    className={cn(
                      'w-20 h-20 rounded-xl overflow-hidden transition-all duration-200',
                      isSelected
                        ? 'ring-[3px] ring-primary bg-primary/10 shadow-[0_0_20px_rgba(0,212,255,0.4)]'
                        : 'bg-secondary/30 hover:bg-secondary/50'
                    )}
                  >
                    <PartThumbnail
                      part={part}
                      isSelected={isSelected}
                      onClick={() => onPartSelect(part.id)}
                    />
                  </div>
                  <span
                    className={cn(
                      'text-xs font-medium text-center max-w-20 truncate transition-colors',
                      isSelected
                        ? 'text-primary'
                        : 'text-muted-foreground group-hover:text-foreground'
                    )}
                  >
                    {part.nameKo}
                  </span>
                </button>
              );
            })}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={scrollRight}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="p-3 border-b border-border flex-shrink-0">
          <h3 className="text-sm font-medium text-foreground">부품 설명</h3>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-3">
            {selectedPart ? (
              <PartDescription part={selectedPart} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">부품을 선택하세요</p>
                <p className="text-xs mt-1">위 목록에서 부품을 클릭하면</p>
                <p className="text-xs">상세 설명이 표시됩니다</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
}

function PartDescription({ part }: { part: ModelPart }) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-base font-semibold text-primary">{part.nameKo}</h4>
        <p className="text-xs text-muted-foreground">{part.name}</p>
      </div>

      <div>
        <h5 className="text-xs font-medium text-foreground mb-1">역할</h5>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {part.role}
        </p>
      </div>

      <div>
        <h5 className="text-xs font-medium text-foreground mb-1">재질</h5>
        <p className="text-sm text-muted-foreground">{part.material}</p>
      </div>

      <div className="pt-2 border-t border-border">
        <h5 className="text-xs font-medium text-foreground mb-2">관련 정보</h5>
        <ul className="space-y-1.5">
          <li className="text-xs text-muted-foreground flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>3D 모델에서 직접 클릭하여 부품을 확인할 수 있습니다</span>
          </li>
          <li className="text-xs text-muted-foreground flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>분해도 슬라이더로 내부 구조를 살펴보세요</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
