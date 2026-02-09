'use client';

import React, { useState } from 'react';

import { X } from 'lucide-react';

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
import { PDFViewerPanel } from './panels/pdf-panel';
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
  selectedParts: ModelPart[];
  onPanelToggle?: (isOpen: boolean) => void;
  onQuizActiveChange?: (isActive: boolean) => void;
  captureCanvas?: () => string | null;
}

export function StudyLeftPanel({
  model,
  modelId,
  notes,
  onNotesChange,
  selectedParts,
  onPanelToggle,
  onQuizActiveChange,
  captureCanvas,
}: StudyLeftPanelProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab | null>(null);

  const handleTabClick = (tabId: SidebarTab) => {
    const next = activeTab === tabId ? null : tabId;
    setActiveTab(next);
    onPanelToggle?.(next !== null);
    if (next !== 'quiz') {
      onQuizActiveChange?.(false);
    }
  };

  return (
    <aside className="h-full relative flex shrink-0">
      <div
        className="w-[72px] h-full shrink-0 flex flex-col justify-between rounded-[16px] z-20"
        style={{
          background: 'rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(1px)',
          WebkitBackdropFilter: 'blur(1px)',
        }}
      >
        <div className="flex flex-col items-center gap-[12px] pt-3">
          {sidebarTopItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className="w-[52px] h-[52px] flex flex-col items-center justify-center gap-1 transition-all duration-200 relative group"
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
                    'relative z-10 w-4 h-4 flex items-center justify-center transition-colors duration-200',
                    isActive
                      ? 'text-[#FAFAFA]'
                      : 'text-white/60 group-hover:text-white/90'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                </div>

                <div
                  className={cn(
                    'relative z-10 flex flex-col items-center gap-0.5 transition-colors duration-200',
                    isActive
                      ? 'text-[#FAFAFA]'
                      : 'text-white/60 group-hover:text-white/90'
                  )}
                >
                  <span className="text-[10px] font-medium leading-tight">
                    {item.label}
                  </span>
                  {item.sublabel && (
                    <span className="text-[10px] font-medium leading-tight">
                      {item.sublabel}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col items-center pb-[16px]">
          <button className="w-4 h-4 flex items-center justify-center transition-colors">
            <SettingsIcon className="w-4 h-4 text-[#717271] hover:text-[#999]" />
          </button>
        </div>
      </div>

      <div
        className={cn(
          'absolute left-[80px] top-0 bottom-0 w-[320px] flex flex-col overflow-hidden z-10',
          'transition-[transform,opacity] duration-300 ease-in-out',
          activeTab !== null
            ? 'translate-x-0 opacity-100 rounded-[20px]'
            : '-translate-x-full opacity-0 pointer-events-none'
        )}
        style={{
          background:
            'linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.05) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(1px)',
          WebkitBackdropFilter: 'blur(1px)',
        }}
      >
        <div className="w-[320px] h-full flex flex-col">
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
                modelTitle={model.nameKo}
                systemPrompt={model.systemPrompt}
                selectedParts={selectedParts}
              />
            )}
            {activeTab === 'quiz' && (
              <QuizPanel
                modelId={modelId}
                onQuizActiveChange={onQuizActiveChange}
              />
            )}
            {activeTab === 'pdf' && (
              <PDFViewerPanel modelId={modelId} captureCanvas={captureCanvas} />
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
