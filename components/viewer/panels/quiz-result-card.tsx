'use client';

import { CheckCircle2, XCircle } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { Quiz, QuizResultItem } from '@/types/model';

interface QuizResultCardProps {
  index: number;
  quiz: Quiz | undefined;
  result: QuizResultItem;
}

export function QuizResultCard({ index, quiz, result }: QuizResultCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4',
        result.correct
          ? 'border-green-500/30 bg-green-500/5'
          : 'border-red-500/30 bg-red-500/5'
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        {result.correct ? (
          <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
        ) : (
          <XCircle className="w-4 h-4 text-red-400 shrink-0" />
        )}
        <span
          className={cn(
            'text-xs font-medium',
            result.correct ? 'text-green-400' : 'text-red-400'
          )}
        >
          문제 {index} - {result.correct ? '정답' : '오답'}
        </span>
      </div>

      {quiz && (
        <p className="text-xs text-white/70 mb-2 leading-relaxed">
          {quiz.question}
        </p>
      )}

      <div className="text-xs text-white/50 mb-1">
        <span className="font-medium text-white/60">정답:</span>{' '}
        {result.correctAnswer}
      </div>

      {result.explanation && (
        <div className="mt-2 pt-2 border-t border-[#595959]/30">
          <p className="text-xs text-white/40 leading-relaxed">
            {result.explanation}
          </p>
        </div>
      )}
    </div>
  );
}

export function QuizSmallIcon({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M9 2C7.895 2 7 2.895 7 4V20C7 21.105 7.895 22 9 22H19C20.105 22 21 21.105 21 20V8L15 2H9ZM14 3.5L19.5 9H15C14.448 9 14 8.552 14 8V3.5ZM10 12H18V13.5H10V12ZM10 15H18V16.5H10V15ZM10 18H15V19.5H10V18ZM3 6V18C3 19.657 4.343 21 6 21V6H3Z"
        fill="currentColor"
      />
    </svg>
  );
}
