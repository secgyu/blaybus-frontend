'use client';

import React, { useState } from 'react';

import {
  EditIcon,
  QuizQIcon,
  RobotIcon,
  WrenchIcon,
} from '@/components/icons/sidebar-icons';
import { generatePdf } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useViewerStore } from '@/store/viewer-store';
import type { PdfRequestDto } from '@/types/api';

interface PDFDownloadItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const pdfDownloadItems: PDFDownloadItem[] = [
  { id: '3d', icon: WrenchIcon, label: '3D 오브젝트 이미지 및 설명' },
  { id: 'memo', icon: EditIcon, label: '메모' },
  { id: 'ai', icon: RobotIcon, label: 'AI 어시스턴트' },
  { id: 'quiz', icon: QuizQIcon, label: '퀴즈' },
];

interface PDFViewerPanelProps {
  modelId: string;
  captureCanvas?: () => string | null;
}

export function PDFViewerPanel({
  modelId,
  captureCanvas,
}: PDFViewerPanelProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(
    new Set(['3d'])
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const store = useViewerStore(modelId);
  const notes = store((s) => s.notes);
  const aiHistory = store((s) => s.aiHistory);
  const quizQuestions = store((s) => s.quizQuestions);
  const quizResults = store((s) => s.quizResults);

  const toggleItem = (id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const buildPdfRequestBody = (): PdfRequestDto => {
    const body: PdfRequestDto = {};

    if (selectedItems.has('3d') && captureCanvas) {
      const dataUrl = captureCanvas();
      if (dataUrl) {
        body.modelImage = dataUrl;
      }
    }

    if (selectedItems.has('memo')) {
      body.memo = notes;
    }

    if (selectedItems.has('ai') && aiHistory.length > 0) {
      body.chatLogs = [];
      for (let i = 0; i < aiHistory.length; i += 2) {
        const userMsg = aiHistory[i];
        const assistantMsg = aiHistory[i + 1];
        if (userMsg) {
          body.chatLogs.push({
            question: userMsg.content,
            answer: assistantMsg?.content ?? '',
          });
        }
      }
    }

    if (selectedItems.has('quiz') && quizResults) {
      body.quizs = quizResults.results.map((r) => {
        const quiz = quizQuestions.find((q) => q.questionId === r.questionId);

        let userAnswerStr = String(r.userSelected ?? '');
        if (quiz?.type === 'MULTIPLE_CHOICE' && r.userSelected != null) {
          const selectedOption = quiz.options.find(
            (o) => o.no === Number(r.userSelected)
          );
          if (selectedOption) {
            userAnswerStr = `${selectedOption.no}. ${selectedOption.content}`;
          }
        }

        return {
          quizQuestion: quiz?.question ?? `문제 ${r.questionId}`,
          quizAnswer: `선택: ${userAnswerStr} / 정답: ${r.correctAnswer}`,
        };
      });
    }

    return body;
  };

  const handlePreview = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const body = buildPdfRequestBody();
      const blob = await generatePdf({
        modelId,
        type: 'preview',
        body,
      });

      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch {
      setError('미리보기에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const body = buildPdfRequestBody();
      const blob = await generatePdf({
        modelId,
        type: 'download',
        body,
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${modelId}_report.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError('PDF 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full px-5 pb-5">
      <p className="text-sm text-[#B8B8B8] mb-5">
        PDF로 다운로드 할 항목을 선택해주세요.
      </p>

      <div
        className="rounded-xl overflow-hidden"
        style={{ background: 'rgba(184, 184, 184, 0.1)' }}
      >
        {pdfDownloadItems.map((item, index) => {
          const isSelected = selectedItems.has(item.id);
          return (
            <button
              key={item.id}
              onClick={() => toggleItem(item.id)}
              disabled={isLoading}
              className={cn(
                'w-full flex items-center gap-3 px-5 py-3 transition-colors hover:bg-white/5',
                index < pdfDownloadItems.length - 1 &&
                  'border-b border-dashed border-[#FAFAFA]/20'
              )}
            >
              <div className="w-10 h-10 rounded-[10px] bg-[#595959] flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-[#FAFAFA]" />
              </div>

              <span className="flex-1 text-xs text-[#FAFAFA] text-left">
                {item.label}
              </span>

              <div
                className={cn(
                  'w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                  isSelected ? 'border-[#3B82F6]' : 'border-[#D6D3D1]'
                )}
              >
                {isSelected && (
                  <div className="w-3 h-3 rounded-full bg-[#3B82F6]" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="text-xs text-red-400 mt-3 text-center">{error}</p>
      )}

      <div className="mt-auto pt-5 flex flex-col gap-2">
        <button
          className="w-full h-12 rounded-xl border border-[#3B82F6] text-[#3B82F6] font-bold text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
          disabled={selectedItems.size === 0 || isLoading}
          onClick={handlePreview}
        >
          {isLoading ? 'PDF 생성 중...' : 'PDF 미리보기'}
        </button>
        <button
          className="w-full h-12 rounded-xl text-[#FAFAFA] font-bold text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
          }}
          disabled={selectedItems.size === 0 || isLoading}
          onClick={handleDownload}
        >
          {isLoading ? 'PDF 생성 중...' : '학습 내용 PDF 다운받기'}
        </button>
      </div>
    </div>
  );
}
