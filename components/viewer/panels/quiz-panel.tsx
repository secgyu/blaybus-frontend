'use client';

import { useEffect } from 'react';

import { ChevronLeft, ChevronRight, Loader2, RotateCcw } from 'lucide-react';

import { useQuiz } from '@/hooks/use-quiz';
import { cn } from '@/lib/utils';
import { useViewerStore } from '@/store/viewer-store';

import { QuizResultCard, QuizSmallIcon } from './quiz-result-card';

interface QuizPanelProps {
  modelId: string;
  onQuizActiveChange?: (isActive: boolean) => void;
}

export function QuizPanel({ modelId, onQuizActiveChange }: QuizPanelProps) {
  const store = useViewerStore(modelId);
  const setQuizResults = store((s) => s.setQuizResults);

  const {
    state,
    quizzes,
    currentIndex,
    currentQuiz,
    answers,
    results,
    error,
    allAnswered,
    startQuiz,
    setAnswer,
    handleSubmit,
    goToPrev,
    goToNext,
  } = useQuiz(modelId, { onResults: setQuizResults });

  useEffect(() => {
    onQuizActiveChange?.(state !== 'idle');
  }, [state, onQuizActiveChange]);

  if (state === 'idle') {
    return (
      <div className="flex flex-col h-full px-5 pb-5">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-[#60A5FA]/20 flex items-center justify-center mb-4">
            <QuizSmallIcon className="w-8 h-8 text-[#60A5FA]" />
          </div>
          <p className="text-sm text-white/50 text-center leading-relaxed mb-6">
            현재 학습 중인 모델에 대한
            <br />
            퀴즈를 풀어보세요.
          </p>
          {error && (
            <p className="text-xs text-red-400 mb-4 text-center">{error}</p>
          )}
          <button
            onClick={startQuiz}
            className="w-full max-w-[240px] h-[48px] rounded-xl bg-[#1E40AF] hover:bg-[#1E3A8A] text-white text-sm font-medium transition-colors flex items-center justify-center"
          >
            퀴즈 시작하기
          </button>
        </div>
      </div>
    );
  }

  if (state === 'loading') {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#60A5FA] animate-spin mb-3" />
        <p className="text-sm text-white/50">퀴즈를 불러오는 중...</p>
      </div>
    );
  }

  if (state === 'answering' || state === 'submitting') {
    const currentAnswer = answers.get(currentQuiz.questionId);

    return (
      <div className="flex flex-col h-full px-5 pb-5">
        <div className="shrink-0 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#595959]">
              {currentIndex + 1} / {quizzes.length}
            </span>
          </div>
          <div className="w-full h-1 bg-[#595959]/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#60A5FA] rounded-full transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / quizzes.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-5">
          <div className="py-3">
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-[#60A5FA]/20 text-[#60A5FA] mb-3">
              {currentQuiz.type === 'MULTIPLE_CHOICE' ? '객관식' : '주관식'}
            </span>

            <p className="text-sm text-white leading-relaxed mb-5">
              {currentQuiz.question}
            </p>

            {currentQuiz.type === 'MULTIPLE_CHOICE' ? (
              <div className="flex flex-col gap-2">
                {currentQuiz.options.map((option) => {
                  const isSelected =
                    currentAnswer?.selectedOptionNo === option.no;
                  return (
                    <button
                      key={option.no}
                      onClick={() =>
                        setAnswer(currentQuiz, {
                          questionId: currentQuiz.questionId,
                          type: 'MULTIPLE_CHOICE',
                          selectedOptionNo: option.no,
                        })
                      }
                      disabled={state === 'submitting'}
                      className={cn(
                        'w-full text-left px-4 py-3 rounded-xl border text-sm transition-all',
                        isSelected
                          ? 'border-[#60A5FA] bg-[#60A5FA]/10 text-white'
                          : 'border-[#595959]/50 text-white/70 hover:border-[#595959] hover:text-white'
                      )}
                    >
                      <span className="font-medium mr-2">{option.no}.</span>
                      {option.content}
                    </button>
                  );
                })}
              </div>
            ) : (
              <textarea
                value={currentAnswer?.subjectiveAnswer || ''}
                onChange={(e) =>
                  setAnswer(currentQuiz, {
                    questionId: currentQuiz.questionId,
                    type: 'SHORT_ANSWER',
                    subjectiveAnswer: e.target.value,
                  })
                }
                disabled={state === 'submitting'}
                placeholder="답변을 입력하세요..."
                className="w-full h-[120px] p-4 bg-transparent border border-[#595959]/50 rounded-xl text-sm text-white placeholder:text-[#595959] focus:outline-none focus:border-[#60A5FA]/50 resize-none transition-colors"
              />
            )}
          </div>
        </div>

        {error && (
          <div className="mx-5 mb-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 shrink-0">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        <div className="p-5 pt-3 shrink-0 flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={goToPrev}
              disabled={currentIndex === 0 || state === 'submitting'}
              className="flex-1 h-[40px] rounded-xl border border-[#595959]/50 text-white/70 text-sm flex items-center justify-center gap-1 hover:border-[#595959] hover:text-white transition-colors disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
              이전
            </button>
            <button
              onClick={goToNext}
              disabled={
                currentIndex === quizzes.length - 1 || state === 'submitting'
              }
              className="flex-1 h-[40px] rounded-xl border border-[#595959]/50 text-white/70 text-sm flex items-center justify-center gap-1 hover:border-[#595959] hover:text-white transition-colors disabled:opacity-30"
            >
              다음
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {allAnswered && (
            <button
              onClick={handleSubmit}
              disabled={state === 'submitting'}
              className="w-full h-[48px] rounded-xl bg-[#1E40AF] hover:bg-[#1E3A8A] text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {state === 'submitting' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  채점 중...
                </>
              ) : (
                '답안 제출하기'
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (state === 'results' && results) {
    const correctCount = results.results.filter((r) => r.correct).length;
    const totalCount = results.results.length;

    return (
      <div className="flex flex-col h-full px-5 pb-5">
        <div className="shrink-0 mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-[#60A5FA]">
                {correctCount}
              </span>
              <span className="text-sm text-white/50">/ {totalCount}</span>
            </div>
            <span className="text-sm text-white/40">정답</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-5">
          <div className="flex flex-col gap-4 py-3">
            {results.results.map((result, idx) => {
              const quiz = quizzes.find(
                (q) => q.questionId === result.questionId
              );
              return (
                <QuizResultCard
                  key={result.questionId}
                  index={idx + 1}
                  quiz={quiz}
                  result={result}
                />
              );
            })}
          </div>
        </div>

        <div className="p-5 pt-3 shrink-0">
          <button
            onClick={startQuiz}
            className="w-full h-[48px] rounded-xl bg-[#1E40AF] hover:bg-[#1E3A8A] text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            다시 풀기
          </button>
        </div>
      </div>
    );
  }

  return null;
}
