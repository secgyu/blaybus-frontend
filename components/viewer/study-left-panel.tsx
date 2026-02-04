'use client';

import React, { useRef, useState } from 'react';

import {
  Bot,
  HelpCircle,
  Loader2,
  Send,
  StickyNote,
  Trash2,
} from 'lucide-react';

import type { ChatMessage, Model } from '@/lib/types';
import { cn } from '@/lib/utils';

type TabId = 'memo' | 'ai' | 'quiz';

interface StudyLeftPanelProps {
  model: Model;
  notes: string;
  onNotesChange: (notes: string) => void;
  aiHistory: ChatMessage[];
  onSendMessage: (message: string) => void;
  onClearHistory: () => void;
  isAiLoading: boolean;
}

const tabs: {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'memo', label: '메모', icon: StickyNote },
  { id: 'ai', label: 'AI', icon: Bot },
  { id: 'quiz', label: '퀴즈', icon: HelpCircle },
];

export function StudyLeftPanel({
  model,
  notes,
  onNotesChange,
  aiHistory,
  onSendMessage,
  onClearHistory,
  isAiLoading,
}: StudyLeftPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('memo');
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isAiLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <aside className="h-full bg-card/80 backdrop-blur-sm border-r border-border flex">
      <div className="w-12 flex flex-col border-r border-border bg-card/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'w-full py-4 flex flex-col items-center justify-center gap-1 transition-colors',
              activeTab === tab.id
                ? 'bg-primary/10 text-primary border-r-2 border-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            )}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="p-3 border-b border-border flex-shrink-0">
          <h2 className="text-sm font-medium text-foreground">
            {tabs.find((t) => t.id === activeTab)?.label}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            학습 내용을 메모하세요...
          </p>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {activeTab === 'memo' && (
            <MemoContent notes={notes} onNotesChange={onNotesChange} />
          )}

          {activeTab === 'ai' && (
            <AIContent
              model={model}
              aiHistory={aiHistory}
              inputValue={inputValue}
              setInputValue={setInputValue}
              onSubmit={handleSubmit}
              onSendMessage={onSendMessage}
              onClearHistory={onClearHistory}
              isAiLoading={isAiLoading}
              messagesEndRef={messagesEndRef}
            />
          )}

          {activeTab === 'quiz' && <QuizContent />}
        </div>
      </div>
    </aside>
  );
}

function MemoContent({
  notes,
  onNotesChange,
}: {
  notes: string;
  onNotesChange: (notes: string) => void;
}) {
  return (
    <div className="flex-1 p-3 flex flex-col overflow-hidden">
      <textarea
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder="학습 내용을 메모하세요..."
        className="flex-1 w-full p-3 text-sm bg-secondary/50 rounded-lg border border-border focus:border-primary focus:outline-none resize-none transition-colors text-foreground placeholder:text-muted-foreground"
      />
      <p className="mt-2 text-xs text-muted-foreground flex-shrink-0">
        메모는 자동으로 저장됩니다
      </p>
    </div>
  );
}

function AIContent({
  model,
  aiHistory,
  inputValue,
  setInputValue,
  onSubmit,
  onSendMessage,
  onClearHistory,
  isAiLoading,
  messagesEndRef,
}: {
  model: Model;
  aiHistory: ChatMessage[];
  inputValue: string;
  setInputValue: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onSendMessage: (message: string) => void;
  onClearHistory: () => void;
  isAiLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {aiHistory.length === 0 ? (
          <div className="text-center py-6">
            <Bot className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">
              {model.nameKo}에 대해 물어보세요
            </p>
            <div className="mt-3 space-y-1.5">
              <SuggestionChip
                text="작동 원리는?"
                onClick={() =>
                  onSendMessage('이 부품의 작동 원리는 무엇인가요?')
                }
              />
              <SuggestionChip
                text="재료는?"
                onClick={() =>
                  onSendMessage('이 부품은 어떤 재료로 만들어지나요?')
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
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="text-xs">생각 중...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <form
        onSubmit={onSubmit}
        className="p-3 border-t border-border flex-shrink-0"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="질문하기..."
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
            대화 삭제
          </button>
        )}
      </form>
    </>
  );
}

function QuizContent() {
  return (
    <div className="flex-1 p-3 flex flex-col items-center justify-center text-center">
      <HelpCircle className="w-10 h-10 text-muted-foreground/30 mb-2" />
      <p className="text-sm text-muted-foreground">퀴즈 기능 준비 중...</p>
      <p className="text-xs text-muted-foreground mt-1">곧 업데이트됩니다</p>
    </div>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[90%] px-3 py-2 rounded-lg text-xs',
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
      className="block w-full px-2 py-1.5 text-xs text-left rounded-lg bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
    >
      {text}
    </button>
  );
}
