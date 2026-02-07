'use client';

import React, { useState } from 'react';

import {
  EditIcon,
  HelpIcon,
  QuizIcon,
  RobotIcon,
  SettingsIcon,
} from '@/components/icons/sidebar-icons';
import type { ViewerModel, ModelPart } from '@/types/viewer';
import { cn } from '@/lib/utils';

import { AIChatPanel } from './panels/ai-chat-panel';
import { EditPanel } from './panels/edit-panel';
import { QuizPanel } from './panels/quiz-panel';

type SidebarTab = 'edit' | 'robot' | 'quiz';

const sidebarTopIcons: {
  id: SidebarTab;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'edit', icon: EditIcon },
  { id: 'robot', icon: RobotIcon },
  { id: 'quiz', icon: QuizIcon },
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
      <div className="w-[64px] shrink-0 flex flex-col justify-between border-r border-border bg-[#080d1a] z-20">
        <div className="flex flex-col items-center pt-2">
          {sidebarTopIcons.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className="w-[64px] h-[64px] flex items-center justify-center transition-colors relative"
              >
                {isActive && (
                  <div className="absolute inset-2 rounded-xl bg-[#34415C]/50 shadow-[3px_3px_30px_rgba(30,64,175,0.15),-3px_-3px_30px_rgba(30,64,175,0.25)]" />
                )}
                <item.icon
                  className={cn(
                    'relative z-10',
                    isActive ? 'text-white' : 'text-white/80 hover:text-white'
                  )}
                />
              </button>
            );
          })}
        </div>

        <div className="flex flex-col items-center pb-2">
          <button className="w-[64px] h-[64px] flex items-center justify-center transition-colors">
            <HelpIcon className="text-[#717271] hover:text-[#999]" />
          </button>
          <button className="w-[64px] h-[64px] flex items-center justify-center transition-colors">
            <SettingsIcon className="text-[#717271] hover:text-[#999]" />
          </button>
        </div>
      </div>

      <div
        className={cn(
          'absolute left-[64px] top-0 bottom-0 w-[394px] flex flex-col overflow-hidden z-10',
          'transition-[transform,opacity] duration-300 ease-in-out',
          activeTab !== null
            ? 'translate-x-0 opacity-100 rounded-r-[20px] border-y border-r border-[#595959]/50'
            : '-translate-x-full opacity-0 pointer-events-none border-0'
        )}
        style={{
          background:
            'linear-gradient(180deg, rgba(7, 11, 20, 0.95) 0%, rgba(4, 10, 46, 0.92) 100%)',
        }}
      >
        <div className="w-[394px] h-full flex flex-col">
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
        </div>
      </div>
    </aside>
  );
}
