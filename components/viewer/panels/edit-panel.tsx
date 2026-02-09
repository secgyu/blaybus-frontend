'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { Check } from 'lucide-react';

import type { ViewerModel } from '@/types/viewer';

interface EditPanelProps {
  model: ViewerModel;
  notes: string;
  onNotesChange: (notes: string) => void;
}

export function EditPanel({ notes, onNotesChange }: EditPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [scrollRatio, setScrollRatio] = useState(0);
  const [thumbRatio, setThumbRatio] = useState(1);
  const [savedNotes, setSavedNotes] = useState('');
  const [justSaved, setJustSaved] = useState(false);

  const hasContent = notes.trim().length > 0;
  const hasChanges = notes !== savedNotes;

  const updateScrollbar = useCallback(() => {
    const el = textareaRef.current;
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
    const el = textareaRef.current;
    if (!el) return;
    updateScrollbar();
    el.addEventListener('scroll', updateScrollbar);
    return () => el.removeEventListener('scroll', updateScrollbar);
  }, [updateScrollbar]);

  useEffect(() => {
    updateScrollbar();
  }, [notes, updateScrollbar]);

  const handleSave = () => {
    setSavedNotes(notes);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const isBlue = hasContent && hasChanges && !justSaved;

  return (
    <div className="flex flex-col h-full px-5 pb-5">
      <div className="flex-1 min-h-0 rounded-xl border border-[#595959]/50 flex overflow-hidden">
        <textarea
          ref={textareaRef}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="학습 내용을 메모로 남겨보세요"
          className="flex-1 p-5 bg-transparent text-sm text-white/70 placeholder:text-[#717271] focus:outline-none resize-none leading-relaxed overflow-y-auto"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        />

        {thumbRatio < 1 && (
          <div className="relative w-[3px] shrink-0 mr-2 my-4 rounded-full overflow-hidden bg-[#595959]">
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

      <div className="mt-3 shrink-0">
        <button
          onClick={handleSave}
          disabled={!hasContent || !hasChanges || justSaved}
          className="w-full h-[48px] rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
          style={{
            background: isBlue
              ? 'linear-gradient(135deg, #2563EB, #3B82F6)'
              : '#B8B8B8',
            color: isBlue ? '#FFFFFF' : '#FFFFFF',
          }}
        >
          {justSaved ? (
            <>
              <Check className="w-4 h-4" />
              저장되었습니다
            </>
          ) : (
            '학습 메모 저장하기'
          )}
        </button>
      </div>
    </div>
  );
}
