'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import ReactMarkdown from 'react-markdown';

import rehypeRaw from 'rehype-raw';

import { toTitleCase } from '@/lib/constants/materials';
import { fixMarkdownBold } from '@/lib/utils';
import type { ModelPart } from '@/types/viewer';

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

  return (
    <div className="flex gap-4 h-full">
      <div
        ref={contentRef}
        className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="text-sm text-[#FAFAFA] leading-[140%]">
          <p>
            <span className="font-bold">부품 명 :</span> {part.nameKo} (
            {displayName})
          </p>
        </div>

        <div className="markdown-content text-sm text-[#FAFAFA]/80 leading-[180%]">
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>
            {fixMarkdownBold(roleText)}
          </ReactMarkdown>
        </div>
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
