'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { getMaterialLabel, toTitleCase } from '@/lib/constants/materials';
import type { ModelPart } from '@/lib/types';

interface PartDescriptionProps {
  part: ModelPart;
}

export function PartDescription({ part }: PartDescriptionProps) {
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
  const roleText = part.role || '해당 부품의 기능 설명이 준비 중입니다.';
  const materialLabel = part.materialType
    ? getMaterialLabel(part.materialType)
    : '해당 부품의 재질 정보가 준비 중입니다.';

  return (
    <div className="flex gap-4 h-full">
      <div
        ref={contentRef}
        className="flex-1 flex flex-col gap-8 overflow-y-auto pr-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <section className="flex flex-col gap-1">
          <h4 className="text-base font-bold text-[#FAFAFA] leading-[140%]">
            부품 명 및 기능
          </h4>
          <div className="py-2">
            <div className="text-sm text-[#FAFAFA] leading-[140%] space-y-1">
              <p>
                <span className="font-medium">1. 부품 명 :</span> {part.nameKo}{' '}
                ({displayName})
              </p>
              <p>
                <span className="font-medium">2. 기능 :</span> {roleText}
              </p>
            </div>
          </div>
        </section>

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
