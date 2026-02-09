'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { Loader2, Send } from 'lucide-react';

import { sendChatMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useViewerStore } from '@/store/viewer-store';
import type { ModelPart } from '@/types/viewer';

interface AIChatPanelProps {
  modelId: string;
  modelTitle: string;
  systemPrompt: string;
  selectedParts: ModelPart[];
}

export function AIChatPanel({
  modelId,
  modelTitle,
  selectedParts,
}: AIChatPanelProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [wasCleared, setWasCleared] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const store = useViewerStore(modelId);
  const aiHistory = store((s) => s.aiHistory);
  const addChatMessage = store((s) => s.addChatMessage);
  const clearChatHistory = store((s) => s.clearChatHistory);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiHistory, isLoading]);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim() || isLoading) return;

      setWasCleared(false);
      addChatMessage({ role: 'user', content: message });

      const history = aiHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      setIsLoading(true);
      try {
        const response = await sendChatMessage({
          modelId,
          message,
          history,
          model: { modelId, title: modelTitle },
          parts: selectedParts.map((p) => ({
            partId: p.id,
            displayNameKo: p.nameKo,
            summary: p.role,
          })),
        });
        addChatMessage({ role: 'assistant', content: response.answer });
      } catch {
        addChatMessage({
          role: 'assistant',
          content:
            '죄송합니다. 응답을 가져오는 중 오류가 발생했습니다. 다시 시도해주세요.',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [modelId, modelTitle, selectedParts, isLoading, aiHistory, addChatMessage]
  );

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    const message = input.trim();
    setInput('');
    sendMessage(message);
  };

  return (
    <div className="flex flex-col h-full px-5 pb-5">
      {selectedParts.length > 0 && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-[#60A5FA]/10 border border-[#60A5FA]/20 shrink-0">
          <p className="text-xs text-[#60A5FA]">
            현재 선택된 부품: {selectedParts.map((p) => p.nameKo).join(', ')}
          </p>
        </div>
      )}

      <div className="flex-1 min-h-0 rounded-xl border border-[#595959]/50 overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto px-4">
          {aiHistory.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <p className="text-sm text-[#595959] leading-relaxed mb-6">
                AI 어시스턴트에게 질문해보세요!
                <br />
                학습 중인 모델의 각 부품과
                <br />
                동작 원리에 대해 물어볼 수 있습니다.
              </p>
              <div className="flex flex-col gap-2.5 w-full">
                {[
                  '이 모델의 작동 원리를 설명해줘',
                  '주요 부품의 역할이 뭐야?',
                  '실제 응용 사례를 알려줘',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => sendMessage(suggestion)}
                    className="h-[28px] px-4 rounded-full bg-[#60A5FA]/50 text-xs text-[#D6D3D1] hover:bg-[#60A5FA]/70 hover:text-white transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 py-3">
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
      </div>

      <div className="mt-3 shrink-0 flex flex-col gap-2">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="질문을 입력하세요."
            disabled={isLoading}
            className="flex-1 h-[46px] px-4 bg-transparent border border-[#595959]/50 rounded-xl text-sm text-white placeholder:text-[#595959] focus:outline-none focus:border-[#60A5FA]/50 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-[46px] h-[46px] shrink-0 rounded-xl text-white flex items-center justify-center transition-colors disabled:cursor-not-allowed"
            style={{
              background:
                input.trim() && !isLoading
                  ? 'linear-gradient(135deg, #2563EB, #3B82F6)'
                  : '#B8B8B8',
            }}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <button
          onClick={() => {
            clearChatHistory();
            setWasCleared(true);
          }}
          disabled={isLoading || aiHistory.length === 0}
          className={cn(
            'relative w-full h-[48px] rounded-xl text-sm font-medium transition-colors disabled:cursor-not-allowed flex items-center justify-center',
            aiHistory.length === 0 && wasCleared
              ? 'bg-white text-[#1A1A1A]'
              : aiHistory.length > 0
                ? 'text-white hover:opacity-90'
                : 'bg-[#B8B8B8] text-white'
          )}
          style={
            aiHistory.length > 0
              ? { background: 'linear-gradient(135deg, #2563EB, #3B82F6)' }
              : undefined
          }
        >
          새로운 채팅 시작하기
        </button>
      </div>
    </div>
  );
}
