'use client';

import { useEffect, useRef } from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import type { Model } from '@/lib/types';
import { cn } from '@/lib/utils';

import { PartDescription } from './part-description';
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
    scrollContainerRef.current?.scrollBy({ left: -120, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 120, behavior: 'smooth' });
  };

  return (
    <aside
      className="h-full flex flex-col p-5 gap-5"
      style={{
        background:
          'linear-gradient(180deg, rgba(7, 11, 20, 0.55) 0%, rgba(4, 10, 46, 0.5) 100%)',
        border: '0.5px solid #595959',
        borderRadius: '20px',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div className="flex flex-col gap-1 shrink-0">
        <div className="flex items-center py-2 px-1">
          <h2 className="text-xl font-bold text-[#FAFAFA]">부품 목록</h2>
        </div>

        <div
          className="flex items-center rounded-xl"
          style={{ background: 'rgba(7, 11, 20, 0.85)' }}
        >
          <button
            onClick={scrollLeft}
            className="shrink-0 flex items-center justify-center px-3 py-0.5 text-[#FAFAFA] hover:text-[#60A5FA] transition-colors"
          >
            <ChevronLeft className="w-4 h-5" />
          </button>

          <div
            ref={scrollContainerRef}
            className="flex-1 flex items-center gap-3 overflow-x-auto py-2 px-2"
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
                  className="shrink-0 flex flex-col items-center gap-2"
                >
                  <div
                    className={cn(
                      'w-[82px] h-[82px] rounded-xl overflow-hidden transition-all duration-200',
                      isSelected
                        ? 'border border-[#60A5FA] bg-[rgba(20,21,23,0.3)]'
                        : 'bg-[rgba(20,21,23,0.3)]'
                    )}
                  >
                    <PartThumbnail
                      part={part}
                      isSelected={isSelected}
                      onClick={() => onPartSelect(part.id)}
                    />
                  </div>
                  <div className="flex justify-center items-center w-[83px] px-1 py-0.5">
                    <span
                      className={cn(
                        'text-[13px] text-center leading-[140%] line-clamp-1',
                        isSelected ? 'text-[#60A5FA]' : 'text-[#FAFAFA]'
                      )}
                    >
                      {part.nameKo}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={scrollRight}
            className="shrink-0 flex items-center justify-center px-3 py-0.5 text-[#FAFAFA] hover:text-[#60A5FA] transition-colors"
          >
            <ChevronRight className="w-4 h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-1 flex-1 min-h-0">
        <div className="flex items-center py-2 px-1 w-full">
          <h2 className="text-xl font-bold text-[#FAFAFA]">부품 설명</h2>
        </div>

        <div
          className="flex-1 min-h-0 w-full rounded-xl p-5 overflow-hidden"
          style={{ border: '0.5px solid #595959' }}
        >
          {selectedPart ? (
            <PartDescription part={selectedPart} />
          ) : (
            <div className="flex items-center justify-center h-full text-[#595959]">
              <p className="text-sm">부품을 선택하세요</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
