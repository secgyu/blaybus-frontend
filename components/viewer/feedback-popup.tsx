'use client';

import { useCallback, useEffect, useState } from 'react';

import { createPortal } from 'react-dom';

import { X } from 'lucide-react';

function FeedbackIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <mask
        id="mask0_fb"
        style={{ maskType: 'luminance' }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="24"
        height="24"
      >
        <path d="M24 0H0V24H24V0Z" fill="white" />
      </mask>
      <g mask="url(#mask0_fb)">
        <path
          d="M20 2H4C2.9 2 2.01 2.9 2.01 4L2 22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM13 14H11V12H13V14ZM13 10H11V6H13V10Z"
          fill="#3B82F6"
        />
      </g>
    </svg>
  );
}

const STORAGE_KEY = 'simvex-feedback-dismissed';

function isFeedbackDismissed(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

function markFeedbackDismissed() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, 'true');
}

interface FeedbackPopupProps {
  open: boolean;
  onClose: () => void;
  formUrl: string;
  title: string;
  description: string;
}

function FeedbackPopup({
  open,
  onClose,
  formUrl,
  title,
  description,
}: FeedbackPopupProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!open || !mounted) return null;

  const handleGoToForm = () => {
    markFeedbackDismissed();
    window.open(formUrl, '_blank');
    onClose();
  };

  const handleDismiss = () => {
    markFeedbackDismissed();
    onClose();
  };

  return createPortal(
    <div className="fixed bottom-6 right-6 z-[9999] animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div
        className="relative flex flex-col items-start rounded-[20px]"
        style={{
          width: '255px',
          padding: '20px 12px',
          gap: '24px',
          background: 'rgba(26, 26, 26, 0.5)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
        }}
      >
        <div className="flex items-center justify-between w-full px-1">
          <div className="flex items-center gap-2">
            <FeedbackIcon />
            <span className="text-[13px] font-medium text-[#FAFAFA]/70">
              Feedback
            </span>
          </div>
          <button
            onClick={handleDismiss}
            className="w-6 h-6 rounded-full flex items-center justify-center text-[#FAFAFA]/50 hover:text-[#FAFAFA]/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center w-full px-2">
          <h3 className="text-[14px] font-bold text-[#FAFAFA] mb-3">{title}</h3>
          <p className="text-[12px] text-[#B8B8B8] leading-relaxed whitespace-pre-line mb-2">
            {description}
          </p>
          <p className="text-[28px] mb-5">😊</p>

          <button
            onClick={handleGoToForm}
            className="w-full h-[44px] rounded-full text-white text-sm font-semibold transition-opacity hover:opacity-90 flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
            }}
          >
            30초 피드백 남기기
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

const QUIZ_FORM_URL = 'https://forms.gle/QvBqLzG4tg4wXr5X8';

export function useQuizFeedback() {
  const [showPopup, setShowPopup] = useState(false);

  const triggerFeedback = useCallback(() => {
    if (!isFeedbackDismissed()) {
      setShowPopup(true);
    }
  }, []);

  const popup = (
    <FeedbackPopup
      open={showPopup}
      onClose={() => setShowPopup(false)}
      formUrl={QUIZ_FORM_URL}
      title="이 학습이 이해에 도움이 되셨나요?"
      description={
        '30초만 투자해 주시면\n다음 버전을 개선하는데 큰 도움이 됩니다.'
      }
    />
  );

  return { triggerFeedback, popup };
}

const PDF_FORM_URL = 'https://forms.gle/MzXFAMDp87BZ5C4L9';

export function usePdfFeedback() {
  const [showPopup, setShowPopup] = useState(false);

  const triggerFeedback = useCallback(() => {
    if (!isFeedbackDismissed()) {
      setShowPopup(true);
    }
  }, []);

  const popup = (
    <FeedbackPopup
      open={showPopup}
      onClose={() => setShowPopup(false)}
      formUrl={PDF_FORM_URL}
      title="이 학습이 이해해 도움이 되셨나요?"
      description={
        '30초만 투자해 주시면\n다음 버전을 개선하는데 큰 도움이 됩니다.'
      }
    />
  );

  return { triggerFeedback, popup };
}

export function useScrollBottomDetect(
  ref: React.RefObject<HTMLElement | null>,
  onReachBottom: () => void,
  enabled: boolean
) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    let triggered = false;

    const handleScroll = () => {
      if (triggered) return;
      const { scrollTop, scrollHeight, clientHeight } = el;
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        triggered = true;
        onReachBottom();
      }
    };

    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [ref, onReachBottom, enabled]);
}
