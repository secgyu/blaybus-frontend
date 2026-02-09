'use client';

import { useEffect } from 'react';

import { Loader2, RotateCcw } from 'lucide-react';

import { useQuiz } from '@/hooks/use-quiz';
import { cn } from '@/lib/utils';
import { useViewerStore } from '@/store/viewer-store';

import { QuizResultCard } from './quiz-result-card';

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
    startQuiz,
    setAnswer,
    handleSubmit,
    goToNext,
  } = useQuiz(modelId, { onResults: setQuizResults });

  useEffect(() => {
    onQuizActiveChange?.(state !== 'idle');
  }, [state, onQuizActiveChange]);

  if (state === 'idle') {
    return (
      <div className="flex flex-col h-full px-5 pb-5">
        <div
          className="flex-1 min-h-0 rounded-xl flex items-center justify-center"
          style={{ border: '0.5px solid #595959' }}
        >
          <p className="text-sm text-[#595959]">퀴즈로 학습을 마무리해보세요</p>
        </div>

        {error && (
          <p className="text-xs text-red-400 mt-2 text-center">{error}</p>
        )}

        <div className="mt-3 shrink-0">
          <button
            onClick={startQuiz}
            className="w-full h-[48px] rounded-xl text-white text-sm font-medium transition-opacity hover:opacity-90 flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
            }}
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
        <Loader2 className="w-6 h-6 text-[#2563EB] animate-spin mb-3" />
        <p className="text-sm text-[#2563EB]/70">퀴즈를 불러오는 중...</p>
      </div>
    );
  }

  if (state === 'answering' || state === 'submitting') {
    const currentAnswer = answers.get(currentQuiz.questionId);
    const hasAnswer =
      currentQuiz.type === 'MULTIPLE_CHOICE'
        ? currentAnswer?.selectedOptionNo != null
        : (currentAnswer?.subjectiveAnswer ?? '').trim().length > 0;

    const isLastQuestion = currentIndex === quizzes.length - 1;
    const allAnswered = quizzes.every((q) => answers.has(q.questionId));

    const handleBottomButton = () => {
      if (hasAnswer && isLastQuestion && allAnswered) {
        handleSubmit();
      } else {
        goToNext();
      }
    };

    const buttonLabel = hasAnswer ? '정답 확인' : '다음';

    const questionNum = String(currentIndex + 1).padStart(2, '0');

    return (
      <div className="flex flex-col h-full px-5 pb-5">
        <div className="shrink-0 mb-5">
          <div className="w-full h-[3px] bg-[#595959]/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2563EB] rounded-full transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / quizzes.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold text-[#FAFAFA]">
              Question <span className="text-[#3B82F6]">{questionNum}</span>
            </h3>
          </div>

          <div
            className="rounded-xl p-5 mb-5"
            style={{ background: 'rgba(255, 255, 255, 0.06)' }}
          >
            <p className="text-sm text-[#FAFAFA] leading-relaxed">
              {currentQuiz.question}
            </p>
          </div>

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
                      'w-full flex items-center justify-between px-4 py-3.5 rounded-xl border text-sm transition-all',
                      isSelected
                        ? 'border-[#3B82F6] bg-[#3B82F6]/5'
                        : 'border-[#595959]/50 hover:border-[#595959]'
                    )}
                  >
                    <span
                      className={cn(
                        'text-left',
                        isSelected ? 'text-[#FAFAFA]' : 'text-[#FAFAFA]/70'
                      )}
                    >
                      {option.no}. {option.content}
                    </span>

                    <div
                      className={cn(
                        'w-[22px] h-[22px] rounded-full border-2 shrink-0 ml-3 flex items-center justify-center transition-colors',
                        isSelected ? 'border-[#3B82F6]' : 'border-[#595959]'
                      )}
                    >
                      {isSelected && (
                        <div className="w-[12px] h-[12px] rounded-full bg-[#3B82F6]" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div>
              <input
                type="text"
                value={currentAnswer?.subjectiveAnswer || ''}
                onChange={(e) =>
                  setAnswer(currentQuiz, {
                    questionId: currentQuiz.questionId,
                    type: 'SHORT_ANSWER',
                    subjectiveAnswer: e.target.value,
                  })
                }
                disabled={state === 'submitting'}
                placeholder="정답을 입력해주세요.."
                className="w-full px-4 py-3.5 bg-transparent border border-[#595959]/50 rounded-xl text-sm text-[#FAFAFA] placeholder:text-[#595959] focus:outline-none focus:border-[#3B82F6]/50 transition-colors"
              />
            </div>
          )}
        </div>

        {error && (
          <div className="mb-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 shrink-0">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        <div className="pt-3 shrink-0">
          <button
            onClick={handleBottomButton}
            disabled={state === 'submitting' || (!hasAnswer && isLastQuestion)}
            className={cn(
              'w-full h-[48px] rounded-xl text-sm font-medium transition-all flex items-center justify-center',
              hasAnswer
                ? 'text-white hover:opacity-90'
                : 'bg-[#595959]/30 text-[#FAFAFA]/50'
            )}
            style={
              hasAnswer
                ? { background: 'linear-gradient(135deg, #2563EB, #3B82F6)' }
                : undefined
            }
          >
            {state === 'submitting' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                채점 중...
              </>
            ) : (
              buttonLabel
            )}
          </button>
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

        <div className="flex-1 min-h-0 overflow-y-auto">
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

        <div className="pt-3 shrink-0">
          <button
            onClick={startQuiz}
            className="w-full h-[48px] rounded-xl text-white text-sm font-medium transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
            }}
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
