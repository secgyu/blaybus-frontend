import { useState } from 'react';

import { fetchQuiz, submitQuizAnswers } from '@/lib/api';
import type { Quiz, QuizAnswerItem, QuizResultResponse } from '@/types/api';

export type QuizState =
  | 'idle'
  | 'loading'
  | 'answering'
  | 'submitting'
  | 'results';

export interface UseQuizOptions {
  onQuizLoaded?: (quizzes: Quiz[]) => void;
  onResults?: (results: QuizResultResponse) => void;
}

export function useQuiz(modelId: string, options: UseQuizOptions = {}) {
  const [state, setState] = useState<QuizState>('idle');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, QuizAnswerItem>>(
    new Map()
  );
  const [results, setResults] = useState<QuizResultResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentQuiz = quizzes[currentIndex];
  const allAnswered = quizzes.every((q) => answers.has(q.questionId));

  const startQuiz = async () => {
    setState('loading');
    setError(null);
    try {
      const data = await fetchQuiz(modelId, { count: 3 });
      if (data.length === 0) {
        setError('퀴즈가 준비되지 않았습니다.');
        setState('idle');
        return;
      }
      setQuizzes(data);
      options.onQuizLoaded?.(data);
      setCurrentIndex(0);
      setAnswers(new Map());
      setResults(null);
      setState('answering');
    } catch {
      setError('퀴즈를 불러오는 데 실패했습니다.');
      setState('idle');
    }
  };

  const setAnswer = (quiz: Quiz, answer: QuizAnswerItem) => {
    setAnswers((prev) => {
      const next = new Map(prev);
      next.set(quiz.questionId, answer);
      return next;
    });
  };

  const handleSubmit = async () => {
    setState('submitting');
    setError(null);
    try {
      const answerList = Array.from(answers.values());
      const result = await submitQuizAnswers(modelId, answerList);
      setResults(result);
      options.onResults?.(result);
      setState('results');
    } catch {
      setError('답안 제출에 실패했습니다. 다시 시도해주세요.');
      setState('answering');
    }
  };

  const goToPrev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const goToNext = () =>
    setCurrentIndex((i) => Math.min(quizzes.length - 1, i + 1));

  return {
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
  };
}
