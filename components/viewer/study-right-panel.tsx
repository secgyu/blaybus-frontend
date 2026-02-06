'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import type { Model, ModelPart } from '@/lib/types';
import { cn } from '@/lib/utils';

import { PartThumbnail } from './part-thumbnail';

/* ── materialType 한국어 매핑 ── */
const MATERIAL_LABELS: Record<string, string> = {
  METAL_STEEL_POLISHED: '연마 강철 (Steel Polished)',
  METAL_STEEL_MACHINED: '기계가공 강철 (Steel Machined)',
  METAL_STEEL_BRUSHED: '브러시드 강철 (Steel Brushed)',
  METAL_STEEL_HEAT_TREATED: '열처리 강철 (Steel Heat Treated)',
  METAL_CAST_ROUGH: '주조 철 (Cast Rough)',
  METAL_ALUMINUM_MACHINED: '기계가공 알루미늄 (Aluminum Machined)',
  METAL_OILY: '유막 금속 (Oily Metal)',
  PLASTIC_MATTE: '무광 플라스틱 (Plastic Matte)',
  PLASTIC_SATIN: '새틴 플라스틱 (Plastic Satin)',
  PLASTIC_GLOSS: '유광 플라스틱 (Plastic Gloss)',
};

function getMaterialLabel(type: string): string {
  return MATERIAL_LABELS[type] || type.replace(/_/g, ' ');
}

/* ── 부품 이름 Title Case 변환 ── */
function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

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

  // 선택된 부품으로 스크롤
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
      {/* ── 부품 목록 ── */}
      <div className="flex flex-col gap-1 shrink-0">
        <div className="flex items-center py-2 px-1">
          <h2 className="text-xl font-bold text-[#FAFAFA]">부품 목록</h2>
        </div>

        {/* 수평 캐러셀 */}
        <div
          className="flex items-center rounded-xl"
          style={{ background: 'rgba(7, 11, 20, 0.85)' }}
        >
          {/* 왼쪽 화살표 */}
          <button
            onClick={scrollLeft}
            className="shrink-0 flex items-center justify-center px-3 py-0.5 text-[#FAFAFA] hover:text-[#60A5FA] transition-colors"
          >
            <ChevronLeft className="w-4 h-5" />
          </button>

          {/* 부품 썸네일 리스트 */}
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
                  {/* 썸네일 박스 */}
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
                  {/* 부품 이름 */}
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

          {/* 오른쪽 화살표 */}
          <button
            onClick={scrollRight}
            className="shrink-0 flex items-center justify-center px-3 py-0.5 text-[#FAFAFA] hover:text-[#60A5FA] transition-colors"
          >
            <ChevronRight className="w-4 h-5" />
          </button>
        </div>
      </div>

      {/* ── 부품 설명 ── */}
      <div className="flex flex-col items-center gap-1 flex-1 min-h-0">
        <div className="flex items-center py-2 px-1 w-full">
          <h2 className="text-xl font-bold text-[#FAFAFA]">부품 설명</h2>
        </div>

        {/* 설명 컨테이너 */}
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

/* ── 부품 설명 본문 ── */
function PartDescription({ part }: { part: ModelPart }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [scrollRatio, setScrollRatio] = useState(0);
  const [thumbRatio, setThumbRatio] = useState(1);

  const handleScroll = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const maxScroll = scrollHeight - clientHeight;
    if (maxScroll <= 0) {
      setScrollRatio(0);
      setThumbRatio(1);
    } else {
      setScrollRatio(scrollTop / maxScroll);
      setThumbRatio(clientHeight / scrollHeight);
    }
  }, []);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    handleScroll();
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll, part]);

  const displayName = toTitleCase(part.name);
  const roleText =
    part.role || '해당 부품의 기능 설명이 준비 중입니다.';
  const materialLabel = part.materialType
    ? getMaterialLabel(part.materialType)
    : '해당 부품의 재질 정보가 준비 중입니다.';

  return (
    <div className="flex gap-4 h-full">
      {/* 텍스트 콘텐츠 */}
      <div
        ref={contentRef}
        className="flex-1 flex flex-col gap-8 overflow-y-auto pr-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* 부품 명 및 기능 */}
        <section className="flex flex-col gap-1">
          <h4 className="text-base font-bold text-[#FAFAFA] leading-[140%]">
            부품 명 및 기능
          </h4>
          <div className="py-2">
            <div className="text-sm text-[#FAFAFA] leading-[140%] space-y-1">
              <p>
                <span className="font-medium">1. 부품 명 :</span>{' '}
                {part.nameKo} ({displayName})
              </p>
              <p>
                <span className="font-medium">2. 기능 :</span> {roleText}
              </p>
            </div>
          </div>
        </section>

        {/* 재질 정보 */}
        <section className="flex flex-col gap-1">
          <h4 className="text-base font-bold text-[#FAFAFA] leading-[140%]">
            재질 정보
          </h4>
          <div className="py-2">
            <div className="text-sm text-[#FAFAFA] leading-[140%] space-y-1">
              <p>
                <span className="font-medium">1.</span> {materialLabel}
              </p>
            </div>
          </div>
        </section>

        {/* 기계적 특성 */}
        <section className="flex flex-col gap-1">
          <h4 className="text-base font-bold text-[#FAFAFA] leading-[140%]">
            기계적 특성
          </h4>
          <div className="py-2">
            <div className="text-sm text-[#FAFAFA] leading-[140%] space-y-1">
              <p>
                <span className="font-medium">1.</span> 해당 부품의 기계적 특성
                정보가 준비 중입니다.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* 스크롤 프로그레스 바 */}
      {thumbRatio < 1 && (
        <div className="relative w-[3px] shrink-0 rounded-full overflow-hidden bg-[#595959]">
          <div
            className="absolute left-0 w-full rounded-full bg-[#D6D3D1] transition-[top] duration-100"
            style={{
              height: `${thumbRatio * 100}%`,
              top: `${scrollRatio * (1 - thumbRatio) * 100}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}
