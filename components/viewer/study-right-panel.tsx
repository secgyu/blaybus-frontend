'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import ReactMarkdown from 'react-markdown';

import rehypeRaw from 'rehype-raw';

import {
  ChevronDownIcon,
  LeftArrowIcon,
  RightArrowIcon,
} from '@/components/icons/sidebar-icons';
import { cn, fixMarkdownBold } from '@/lib/utils';
import type { ViewerModel } from '@/types/viewer';

import { PartDescription } from './part-description';
import { PartThumbnail } from './part-thumbnail';

interface StudyRightPanelProps {
  model: ViewerModel;
  selectedPartIds: string[];
  onPartSelect: (partId: string) => void;
  isQuizActive?: boolean;
}

export function StudyRightPanel({
  model,
  selectedPartIds,
  onPartSelect,
  isQuizActive = false,
}: StudyRightPanelProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const partRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const lastSelectedPartId =
    selectedPartIds.length > 0
      ? selectedPartIds[selectedPartIds.length - 1]
      : null;
  const selectedPart = lastSelectedPartId
    ? model.parts.find((p) => p.id === lastSelectedPartId)
    : undefined;

  const [isOverviewOpen, setIsOverviewOpen] = useState(true);
  const [isPartDescOpen, setIsPartDescOpen] = useState(true);

  const overviewRef = useRef<HTMLDivElement>(null);
  const [ovScrollRatio, setOvScrollRatio] = useState(0);
  const [ovThumbRatio, setOvThumbRatio] = useState(1);

  const handleOverviewScroll = useCallback(() => {
    const el = overviewRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const maxScroll = scrollHeight - clientHeight;
    if (maxScroll <= 0) {
      setOvScrollRatio(0);
      setOvThumbRatio(1);
    } else {
      setOvScrollRatio(scrollTop / maxScroll);
      setOvThumbRatio(clientHeight / scrollHeight);
    }
  }, []);

  useEffect(() => {
    const el = overviewRef.current;
    if (!el) return;
    handleOverviewScroll();
    el.addEventListener('scroll', handleOverviewScroll);
    return () => el.removeEventListener('scroll', handleOverviewScroll);
  }, [handleOverviewScroll]);

  useEffect(() => {
    if (lastSelectedPartId && scrollContainerRef.current) {
      const partElement = partRefs.current.get(lastSelectedPartId);
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
  }, [lastSelectedPartId]);

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -120, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 120, behavior: 'smooth' });
  };

  return (
    <aside
      className="h-full flex flex-col p-4 gap-3"
      style={{
        background:
          'linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.05) 100%)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(1px)',
        WebkitBackdropFilter: 'blur(1px)',
      }}
    >
      <div className="shrink-0 py-2">
        <h1 className="text-[22px] font-bold text-[#FAFAFA] leading-tight tracking-wide">
          {model.name}
        </h1>
      </div>

      <div
        className={cn(
          'flex flex-col gap-2 min-h-0 transition-all duration-300 ease-in-out',
          isQuizActive ? 'flex-none' : isOverviewOpen ? 'flex-2' : 'flex-none'
        )}
      >
        <button
          onClick={() => !isQuizActive && setIsOverviewOpen((prev) => !prev)}
          className="flex items-center justify-between w-full shrink-0"
        >
          <h2 className="text-base font-bold text-[#FAFAFA]">완제품 설명</h2>
          <ChevronDownIcon
            className={cn(
              'w-6 h-6 text-[#FAFAFA] transition-transform duration-200',
              !isQuizActive && !isOverviewOpen && '-rotate-90'
            )}
          />
        </button>

        <div
          className={cn(
            'rounded-xl overflow-hidden flex transition-all duration-300 ease-in-out',
            isQuizActive
              ? 'h-[80px] opacity-100'
              : isOverviewOpen
                ? 'flex-1 min-h-0 opacity-100'
                : 'h-0 opacity-0'
          )}
          style={{
            border:
              isQuizActive || isOverviewOpen ? '0.5px solid #595959' : 'none',
          }}
        >
          {!isQuizActive && (
            <>
              <div
                ref={overviewRef}
                className="flex-1 p-4 overflow-y-auto"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <div className="markdown-content text-sm text-[#FAFAFA]/80 leading-[180%]">
                  <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                    {fixMarkdownBold(model.theory || model.description)}
                  </ReactMarkdown>
                </div>
              </div>

              {ovThumbRatio < 1 && (
                <div className="relative w-[3px] shrink-0 mr-2 my-4 rounded-full overflow-hidden bg-[#595959]">
                  <div
                    className="absolute left-0 w-full rounded-full bg-[#D6D3D1] transition-[top] duration-100"
                    style={{
                      height: `${ovThumbRatio * 100}%`,
                      top: `${ovScrollRatio * (1 - ovThumbRatio) * 100}%`,
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 shrink-0">
        <h2 className="text-base font-bold text-[#FAFAFA]">부품 목록</h2>

        <div
          className="flex items-center rounded-xl"
          style={{ background: 'rgba(7, 11, 20, 0.08)' }}
        >
          <button
            onClick={scrollLeft}
            className="shrink-0 flex items-center justify-center px-2 py-0.5 text-[#FAFAFA] hover:text-[#60A5FA] transition-colors"
          >
            <LeftArrowIcon className="w-6 h-4" />
          </button>

          <div
            ref={scrollContainerRef}
            className="flex-1 flex items-center gap-3 overflow-x-auto py-2 px-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {model.parts.map((part) => {
              const isSelected = selectedPartIds.includes(part.id);
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
                      'w-[72px] h-[72px] rounded-xl overflow-hidden transition-all duration-200',
                      isSelected
                        ? 'border border-[#60A5FA] bg-[rgba(20,21,23,0.08)]'
                        : 'bg-[rgba(20,21,23,0.08)]'
                    )}
                  >
                    <PartThumbnail
                      part={part}
                      isSelected={isSelected}
                      onClick={() => {}}
                    />
                  </div>
                  <div className="flex justify-center items-center w-[72px] px-1 py-0.5">
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
            className="shrink-0 flex items-center justify-center px-2 py-0.5 text-[#FAFAFA] hover:text-[#60A5FA] transition-colors"
          >
            <RightArrowIcon className="w-6 h-4" />
          </button>
        </div>
      </div>

      <div
        className={cn(
          'flex flex-col gap-2 min-h-0 transition-all duration-300 ease-in-out',
          isQuizActive ? 'flex-none' : isPartDescOpen ? 'flex-3' : 'flex-none'
        )}
      >
        <button
          onClick={() => !isQuizActive && setIsPartDescOpen((prev) => !prev)}
          className="flex items-center justify-between w-full shrink-0"
        >
          <h2 className="text-base font-bold text-[#FAFAFA]">부품 설명</h2>
          <ChevronDownIcon
            className={cn(
              'w-6 h-6 text-[#FAFAFA] transition-transform duration-200',
              !isQuizActive && !isPartDescOpen && '-rotate-90'
            )}
          />
        </button>

        <div
          className={cn(
            'rounded-xl overflow-hidden transition-all duration-300 ease-in-out',
            isQuizActive
              ? 'h-[80px] opacity-100'
              : isPartDescOpen
                ? 'flex-1 min-h-0 opacity-100 p-5'
                : 'h-0 p-0 opacity-0'
          )}
          style={{
            border:
              isQuizActive || isPartDescOpen ? '0.5px solid #595959' : 'none',
          }}
        >
          {!isQuizActive && (
            <>
              {selectedPart ? (
                <PartDescription part={selectedPart} />
              ) : (
                <div className="flex items-center justify-center h-full text-[#595959]">
                  <p className="text-sm">학습을 원하는 부품을 선택해보세요.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
