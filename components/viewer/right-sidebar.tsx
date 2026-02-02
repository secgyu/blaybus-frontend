'use client';

import React from 'react';
import { useEffect, useRef, useState } from 'react';

import { Bot, Loader2, Send, StickyNote, Trash2 } from 'lucide-react';

import type { ChatMessage, Model, ModelPart } from '@/lib/types';
import { cn } from '@/lib/utils';

interface RightSidebarProps {
  model: Model;
  selectedPart: ModelPart | null;
  notes: string;
  onNotesChange: (notes: string) => void;
  aiHistory: ChatMessage[];
  onSendMessage: (message: string) => void;
  onClearHistory: () => void;
  isAiLoading: boolean;
}

export function RightSidebar({
  model,
  selectedPart,
  notes,
  onNotesChange,
  aiHistory,
  onSendMessage,
  onClearHistory,
  isAiLoading,
}: RightSidebarProps) {
  const [activeTab, setActiveTab] = useState<'ai' | 'notes'>('ai');
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isAiLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <aside className="w-[360px] h-full bg-card/80 backdrop-blur-sm border-l border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            <h2 className="font-medium text-foreground">AI 어시스턴트</h2>
          </div>
          <span className="px-2 py-0.5 text-xs rounded-full bg-accent/20 text-accent border border-accent/30">
            Copilot
          </span>
        </div>

        {/* Context info */}
        {selectedPart && (
          <div className="mt-3 p-2 rounded-lg bg-secondary/50 text-xs">
            <span className="text-muted-foreground">선택된 부품: </span>
            <span className="text-primary font-medium">
              {selectedPart.nameKo}
            </span>
          </div>
        )}
      </div>

      {/* Tab Toggle */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('ai')}
          className={cn(
            'flex-1 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2',
            activeTab === 'ai'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Bot className="w-4 h-4" />
          AI
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={cn(
            'flex-1 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2',
            activeTab === 'notes'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <StickyNote className="w-4 h-4" />
          노트
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'ai' ? (
          <>
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {aiHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Bot className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {model.nameKo}에 대해 궁금한 점을 물어보세요
                  </p>
                  <div className="mt-4 space-y-2">
                    <SuggestionChip
                      text="이 부품의 작동 원리는?"
                      onClick={() =>
                        onSendMessage('이 부품의 작동 원리는 무엇인가요?')
                      }
                    />
                    <SuggestionChip
                      text="어떤 재료로 만들어지나요?"
                      onClick={() =>
                        onSendMessage('이 부품은 어떤 재료로 만들어지나요?')
                      }
                    />
                    <SuggestionChip
                      text="다른 부품과의 관계는?"
                      onClick={() =>
                        onSendMessage(
                          '이 부품과 다른 부품과의 관계를 설명해주세요'
                        )
                      }
                    />
                  </div>
                </div>
              ) : (
                <>
                  {aiHistory.map((msg, index) => (
                    <ChatBubble key={index} message={msg} />
                  ))}
                  {isAiLoading && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">생각 중...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSubmit}
              className="p-4 border-t border-border"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="무엇이 궁금하신가요?"
                  disabled={isAiLoading}
                  className="flex-1 px-3 py-2 text-sm bg-secondary rounded-lg border border-border focus:border-primary focus:outline-none transition-colors text-foreground placeholder:text-muted-foreground"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isAiLoading}
                  className="p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              {aiHistory.length > 0 && (
                <button
                  type="button"
                  onClick={onClearHistory}
                  className="mt-2 text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  대화 기록 삭제
                </button>
              )}
            </form>
          </>
        ) : (
          /* Notes Tab */
          <div className="flex-1 p-4 flex flex-col">
            <textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="학습 내용을 메모하세요..."
              className="flex-1 w-full p-3 text-sm bg-secondary rounded-lg border border-border focus:border-primary focus:outline-none resize-none transition-colors text-foreground placeholder:text-muted-foreground"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              메모는 자동으로 저장됩니다
            </p>

            {/* Study cards */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <StudyCard
                title="공학물리학"
                items={['뉴턴 법칙', '에너지 보존']}
              />
              <StudyCard title="열공학" items={['열역학 법칙', '열전달']} />
              <StudyCard title="재료역학" items={['응력-변형률', '내열재료']} />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] px-3 py-2 rounded-lg text-sm',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-foreground'
        )}
      >
        {message.content}
      </div>
    </div>
  );
}

function SuggestionChip({
  text,
  onClick,
}: {
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="block w-full px-3 py-2 text-xs text-left rounded-lg bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
    >
      {text}
    </button>
  );
}

function StudyCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="p-2 rounded-lg bg-secondary/50 border border-border">
      <h4 className="text-xs font-medium text-foreground mb-1">{title}</h4>
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item} className="text-xs text-muted-foreground">
            • {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
