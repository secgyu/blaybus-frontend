'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { Loader2, Send, Trash2 } from 'lucide-react';

import { sendChatMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useViewerStore } from '@/store/viewer-store';
import type { ModelPart } from '@/types/viewer';

interface AIChatPanelProps {
  modelId: string;
  systemPrompt: string;
  selectedPart: ModelPart | null;
}

export function AIChatPanel({ modelId, selectedPart }: AIChatPanelProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const store = useViewerStore(modelId);
  const aiHistory = store((s) => s.aiHistory);
  const addChatMessage = store((s) => s.addChatMessage);
  const clearChatHistory = store((s) => s.clearChatHistory);

  // 새 메시지가 오면 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiHistory, isLoading]);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim() || isLoading) return;

      // 유저 메시지 추가
      addChatMessage({ role: 'user', content: message });

      // 히스토리를 문자열 배열로 변환 (API 스펙에 맞게)
      const history = aiHistory.map((msg) => `${msg.role}: ${msg.content}`);

      setIsLoading(true);
      try {
        const response = await sendChatMessage(modelId, message, history);
        addChatMessage({ role: 'assistant', content: response });
      } catch {
        addChatMessage({
          role: 'assistant',
          content: '죄송합니다. 응답을 가져오는 중 오류가 발생했습니다. 다시 시도해주세요.',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [modelId, isLoading, aiHistory, addChatMessage]
  );

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    const message = input.trim();
    setInput('');
    sendMessage(message);
  };

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="px-6 pt-5 pb-3 shrink-0 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">AI 어시스턴트</h2>
          <p className="text-xs text-white/40 mt-1">
            학습 중인 모델에 대해 질문해보세요
          </p>
        </div>
        {aiHistory.length > 0 && (
          <button
            onClick={clearChatHistory}
            className="mt-1 p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-white/5 transition-colors"
            title="대화 기록 삭제"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 선택된 부품 컨텍스트 표시 */}
      {selectedPart && (
        <div className="mx-5 mb-3 px-3 py-2 rounded-lg bg-[#60A5FA]/10 border border-[#60A5FA]/20 shrink-0">
          <p className="text-xs text-[#60A5FA]">
            현재 선택된 부품: {selectedPart.nameKo}
          </p>
        </div>
      )}

      {/* 메시지 리스트 */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5">
        {aiHistory.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-12 h-12 rounded-full bg-[#60A5FA]/20 flex items-center justify-center mb-3">
              <RobotSmallIcon className="w-6 h-6 text-[#60A5FA]" />
            </div>
            <p className="text-sm text-white/50 leading-relaxed">
              안녕하세요! 학습 중인 모델에 대해
              <br />
              궁금한 점을 물어보세요.
            </p>
            <div className="mt-4 flex flex-col gap-2 w-full">
              {[
                '이 모델의 작동 원리를 설명해줘',
                '주요 부품의 역할이 뭐야?',
                '실제 응용 사례를 알려줘',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => sendMessage(suggestion)}
                  className="text-left px-3 py-2 rounded-lg border border-[#595959]/50 text-xs text-white/60 hover:text-white hover:border-[#60A5FA]/50 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 py-2">
            {aiHistory.map((message, index) => (
              <div
                key={`${message.role}-${message.timestamp}-${index}`}
                className={cn(
                  'flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[85%] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed',
                    message.role === 'user'
                      ? 'bg-[#1E40AF] text-white rounded-br-sm'
                      : 'bg-[#1a1f30] border border-[#595959]/30 text-white/80 rounded-bl-sm'
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#1a1f30] border border-[#595959]/30 text-white/50 text-sm">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>생각 중...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 입력 영역 */}
      <div className="p-5 pt-3 shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="질문을 입력하세요..."
            disabled={isLoading}
            className="flex-1 h-[44px] px-4 bg-transparent border border-[#595959]/50 rounded-xl text-sm text-white placeholder:text-[#595959] focus:outline-none focus:border-[#60A5FA]/50 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-[44px] h-[44px] shrink-0 rounded-xl bg-[#1E40AF] hover:bg-[#1E3A8A] disabled:opacity-30 disabled:hover:bg-[#1E40AF] text-white flex items-center justify-center transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

function RobotSmallIcon({ className }: { className?: string }) {
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
        d="M13 3C13 2.448 12.552 2 12 2C11.448 2 11 2.448 11 3V5H8C6.343 5 5 6.343 5 8V18C5 19.657 6.343 21 8 21H16C17.657 21 19 19.657 19 18V8C19 6.343 17.657 5 16 5H13V3ZM2 10H4V16H2V10ZM22 10H20V16H22V10ZM9 14.5C9.828 14.5 10.5 13.828 10.5 13C10.5 12.172 9.828 11.5 9 11.5C8.172 11.5 7.5 12.172 7.5 13C7.5 13.828 8.172 14.5 9 14.5ZM16.5 13C16.5 12.172 15.828 11.5 15 11.5C14.172 11.5 13.5 12.172 13.5 13C13.5 13.828 14.172 14.5 15 14.5C15.828 14.5 16.5 13.828 16.5 13Z"
        fill="currentColor"
      />
    </svg>
  );
}
