'use client';

import type { ViewerModel } from '@/types/viewer';

interface EditPanelProps {
  model: ViewerModel;
  notes: string;
  onNotesChange: (notes: string) => void;
}

export function EditPanel({ notes, onNotesChange }: EditPanelProps) {
  return (
    <div className="flex flex-col h-full px-5 pb-5">
      <div className="flex-1 min-h-0 rounded-xl border border-[#595959]/50 p-5 overflow-auto">
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="학습 내용을 메모로 남겨보세요"
          className="w-full h-full bg-transparent text-sm text-white/70 placeholder:text-[#717271] focus:outline-none resize-none leading-relaxed"
        />
      </div>

      <div className="mt-3 shrink-0">
        <button className="w-full h-[68px] rounded-xl bg-[#1E40AF] hover:bg-[#1E3A8A] active:bg-[#1e3580] text-white font-medium transition-colors flex items-center justify-center">
          학습 메모 저장하기
        </button>
      </div>
    </div>
  );
}
