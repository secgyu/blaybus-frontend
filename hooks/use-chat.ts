import { useCallback, useEffect, useRef, useState } from 'react';

import { sendChatMessage } from '@/lib/api';
import { useViewerStore } from '@/store/viewer-store';
import type { ModelPart } from '@/types/viewer';

interface UseChatOptions {
  modelId: string;
  modelTitle: string;
  selectedParts: ModelPart[];
}

export function useChat({
  modelId,
  modelTitle,
  selectedParts,
}: UseChatOptions) {
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

  const handleClear = () => {
    clearChatHistory();
    setWasCleared(true);
  };

  return {
    input,
    setInput,
    isLoading,
    wasCleared,
    aiHistory,
    messagesEndRef,
    sendMessage,
    handleSubmit,
    handleClear,
  };
}
