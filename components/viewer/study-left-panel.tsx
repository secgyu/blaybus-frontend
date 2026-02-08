'use client';

import React, { useState } from 'react';

import { Search, X } from 'lucide-react';

import {
  EditIcon,
  PDFIcon,
  QuizQIcon,
  RobotIcon,
  SettingsIcon,
} from '@/components/icons/sidebar-icons';
import { cn } from '@/lib/utils';
import type { ModelPart, ViewerModel } from '@/types/viewer';

import { AIChatPanel } from './panels/ai-chat-panel';
import { EditPanel } from './panels/edit-panel';
import { QuizPanel } from './panels/quiz-panel';

type SidebarTab = 'edit' | 'robot' | 'quiz' | 'pdf';

const panelTitles: Record<SidebarTab, string> = {
  edit: '메모',
  robot: 'AI 어시스턴트',
  quiz: '퀴즈',
  pdf: 'PDF 다운로드',
};

interface SidebarItem {
  id: SidebarTab;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sublabel?: string;
}

const sidebarTopItems: SidebarItem[] = [
  { id: 'edit', icon: EditIcon, label: '메모하기' },
  { id: 'robot', icon: RobotIcon, label: 'AI', sublabel: '어시스턴트' },
  { id: 'quiz', icon: QuizQIcon, label: '퀴즈' },
  { id: 'pdf', icon: PDFIcon, label: 'PDF', sublabel: '다운로드' },
];

interface StudyLeftPanelProps {
  model: ViewerModel;
  modelId: string;
  notes: string;
  onNotesChange: (notes: string) => void;
  selectedPart: ModelPart | null;
}

export function StudyLeftPanel({
  model,
  modelId,
  notes,
  onNotesChange,
  selectedPart,
}: StudyLeftPanelProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab | null>('edit');

  const handleTabClick = (tabId: SidebarTab) => {
    setActiveTab((prev) => (prev === tabId ? null : tabId));
  };

  return (
    <aside className="h-full relative flex shrink-0">
      <div className="w-[168px] h-full shrink-0 flex flex-col justify-between rounded-[20px] border border-[#595959]/30 bg-[#080d1a]/20 backdrop-blur-md z-20">
        <div className="flex flex-col items-center gap-[24px] pt-6">
          {sidebarTopItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className="w-[88px] h-[88px] flex flex-col items-center justify-center gap-2 transition-all duration-200 relative group"
              >
                <div
                  className={cn(
                    'absolute inset-0 rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-[#2563EB]/20 shadow-[3px_3px_30px_rgba(30,64,175,0.25),-3px_-3px_30px_rgba(30,64,175,0.25)]'
                      : 'bg-transparent group-hover:bg-[#2563EB]/10'
                  )}
                />

                <div
                  className={cn(
                    'relative z-10 w-6 h-6 flex items-center justify-center transition-colors duration-200',
                    isActive
                      ? 'text-[#FAFAFA]'
                      : 'text-white/60 group-hover:text-white/90'
                  )}
                >
                  <item.icon className="w-6 h-6" />
                </div>

                <div
                  className={cn(
                    'relative z-10 flex flex-col items-center gap-0.5 transition-colors duration-200',
                    isActive
                      ? 'text-[#FAFAFA]'
                      : 'text-white/60 group-hover:text-white/90'
                  )}
                >
                  <span className="text-[12px] font-medium leading-tight">
                    {item.label}
                  </span>
                  {item.sublabel && (
                    <span className="text-[12px] font-medium leading-tight">
                      {item.sublabel}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col items-center pb-[40px]">
          <button className="w-6 h-6 flex items-center justify-center transition-colors">
            <SettingsIcon className="w-6 h-6 text-[#717271] hover:text-[#999]" />
          </button>
        </div>
      </div>

      <div
        className={cn(
          'absolute left-[176px] top-0 bottom-0 w-[394px] flex flex-col overflow-hidden z-10',
          'transition-[transform,opacity] duration-300 ease-in-out',
          activeTab !== null
            ? 'translate-x-0 opacity-100 rounded-[20px] border border-[#595959]/50'
            : '-translate-x-full opacity-0 pointer-events-none border-0'
        )}
        style={{
          background:
            'linear-gradient(180deg, rgba(7, 11, 20, 0.2) 0%, rgba(4, 10, 46, 0.16) 100%)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="w-[394px] h-full flex flex-col">
          {activeTab && (
            <div className="px-5 pt-6 pb-4 shrink-0 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#FAFAFA]">
                {panelTitles[activeTab]}
              </h2>
              <button
                onClick={() => setActiveTab(null)}
                className="w-6 h-6 rounded-full bg-[#353535] flex items-center justify-center text-[#FAFAFA] hover:bg-[#454545] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex-1 min-h-0 flex flex-col">
            {activeTab === 'edit' && (
              <EditPanel
                model={model}
                notes={notes}
                onNotesChange={onNotesChange}
              />
            )}
            {activeTab === 'robot' && (
              <AIChatPanel
                modelId={modelId}
                systemPrompt={model.systemPrompt}
                selectedPart={selectedPart}
              />
            )}
            {activeTab === 'quiz' && <QuizPanel modelId={modelId} />}
            {activeTab === 'pdf' && <PDFViewerPanel />}
          </div>
        </div>
      </div>
    </aside>
  );
}

function SearchPanel({ model }: { model: ViewerModel }) {
  const [query, setQuery] = useState('');

  const filteredParts = model.parts.filter(
    (part) =>
      query.trim() !== '' &&
      (part.nameKo.toLowerCase().includes(query.toLowerCase()) ||
        part.name.toLowerCase().includes(query.toLowerCase()) ||
        part.role?.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full p-5">
      <h2 className="text-base font-semibold text-white mb-4">부품 검색</h2>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="부품 이름 또는 역할로 검색..."
          className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {query.trim() === '' ? (
          <p className="text-sm text-white/40 text-center mt-8">
            검색어를 입력하세요
          </p>
        ) : filteredParts.length === 0 ? (
          <p className="text-sm text-white/40 text-center mt-8">
            검색 결과가 없습니다
          </p>
        ) : (
          filteredParts.map((part) => (
            <div
              key={part.id}
              className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <h4 className="text-sm font-medium text-white">{part.nameKo}</h4>
              <p className="text-xs text-white/50 mt-1">{part.name}</p>
              {part.role && (
                <p className="text-xs text-white/40 mt-0.5">{part.role}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function PDFViewerPanel() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-5">
      <div className="w-16 h-16 mb-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
        <PDFIcon className="w-8 h-8 text-white/40" />
      </div>
      <h2 className="text-base font-semibold text-white mb-2">PDF 뷰어</h2>
      <p className="text-sm text-white/40 text-center">
        PDF 파일 뷰어 기능이
        <br />곧 추가될 예정입니다.
      </p>
    </div>
  );
}
