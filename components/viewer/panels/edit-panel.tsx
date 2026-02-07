'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { ChevronLeft, X } from 'lucide-react';

import type { Model } from '@/lib/types';

interface EditPanelProps {
  model: Model;
  notes: string;
  onNotesChange: (notes: string) => void;
}

export function EditPanel({ model, notes, onNotesChange }: EditPanelProps) {
  const router = useRouter();
  const [keywords, setKeywords] = useState<string[]>([
    '에너지 변환 원리',
    '직선 운동과 회전 운동',
    '힘과 토크 전달 원리',
    '정밀 가공 기술과 소재 특성',
  ]);

  const removeKeyword = (index: number) => {
    setKeywords((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <div className="px-5 pt-5">
        <button
          onClick={() => router.push('/')}
          className="flex items-center text-white/90 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
          <span className="text-sm ml-0.5">Back</span>
        </button>
      </div>

      <div className="px-6 mt-5">
        <h1 className="text-xl font-bold text-white leading-tight">
          {model.nameKo}
        </h1>
      </div>

      <div className="px-6 mt-5">
        <div className="flex items-center gap-6 text-sm">
          <span className="text-white/50">분류</span>
          <span className="text-white">기계공학</span>
        </div>
      </div>

      <div className="px-6 mt-5">
        <p className="text-sm text-white/50 mb-3">주요 키워드</p>
        <div className="flex flex-wrap gap-2">
          {keywords.map((keyword, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1.5 h-[26px] px-3 rounded-full text-xs text-white bg-[#60A5FA]/50"
            >
              {keyword}
              <button
                onClick={() => removeKeyword(index)}
                className="hover:text-white/60 transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="px-6 mt-8 mb-3">
        <h2 className="text-lg font-bold text-white">학습 메모</h2>
      </div>

      <div className="px-5 flex-1 min-h-0">
        <div className="h-full rounded-xl border border-[#595959]/50 p-5 overflow-auto">
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="크랭크샤프트의 회전 운동이 커넥팅 로드를 통해 피스톤의 왕복 운동으로 변환되는 과정을 3D로 확인합니다. 각 부품의 역할과 상호작용을 학습하며 메모를 남겨 보세요."
            className="w-full h-full bg-transparent text-sm text-white/70 placeholder:text-[#595959] focus:outline-none resize-none leading-relaxed"
          />
        </div>
      </div>

      <div className="p-5">
        <button className="w-full h-[68px] rounded-xl bg-[#1E40AF] hover:bg-[#1E3A8A] active:bg-[#1e3580] text-white font-medium transition-colors flex items-center justify-center">
          학습하기 퀴즈 PDF 생성하기
        </button>
      </div>
    </>
  );
}
