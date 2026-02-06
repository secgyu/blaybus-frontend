'use client';

import React, { useState } from 'react';

import { useRouter } from 'next/navigation';

import { ChevronLeft, X } from 'lucide-react';

import type { Model } from '@/lib/types';
import { cn } from '@/lib/utils';

type SidebarTab = 'edit' | 'robot' | 'search';

/* ─── Custom SVG Icons from Figma ─── */

function EditIcon({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="50 50 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M74.2832 52.8364C73.2513 51.8045 71.5834 51.8045 70.5515 52.8364L69.1332 54.2499L73.7461 58.8628L75.1643 57.4445C76.1962 56.4126 76.1962 54.7447 75.1643 53.7128L74.2832 52.8364ZM60.1856 63.2023C59.8982 63.4897 59.6767 63.8431 59.5495 64.2342L58.1548 68.4182C58.0182 68.8235 58.1266 69.2711 58.4281 69.5773C58.7297 69.8836 59.1773 69.9873 59.5872 69.8506L63.7713 68.4559C64.1576 68.3287 64.511 68.1073 64.8031 67.8198L72.6859 59.9323L68.0684 55.3148L60.1856 63.2023ZM56.5858 54.8295C54.0886 54.8295 52.0625 56.8556 52.0625 59.3528V71.4149C52.0625 73.9122 54.0886 75.9382 56.5858 75.9382H68.6479C71.1452 75.9382 73.1712 73.9122 73.1712 71.4149V66.8916C73.1712 66.0576 72.4975 65.3839 71.6635 65.3839C70.8295 65.3839 70.1557 66.0576 70.1557 66.8916V71.4149C70.1557 72.2489 69.4819 72.9227 68.6479 72.9227H56.5858C55.7518 72.9227 55.078 72.2489 55.078 71.4149V59.3528C55.078 58.5188 55.7518 57.845 56.5858 57.845H61.1091C61.9431 57.845 62.6169 57.1712 62.6169 56.3373C62.6169 55.5033 61.9431 54.8295 61.1091 54.8295H56.5858Z"
        fill="currentColor"
      />
    </svg>
  );
}

function RobotIcon({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="51 122 26 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M65.5 126.002C65.5 126.446 65.3069 126.845 65 127.12V129.002H70C71.6569 129.002 73 130.345 73 132.002V142.002C73 143.659 71.6569 145.002 70 145.002H58C56.3432 145.002 55 143.659 55 142.002V132.002C55 130.345 56.3432 129.002 58 129.002H63V127.12C62.6931 126.845 62.5 126.446 62.5 126.002C62.5 125.174 63.1716 124.502 64 124.502C64.8284 124.502 65.5 125.174 65.5 126.002ZM52 134.002H54V140.002H52V134.002ZM76 134.002H74V140.002H76V134.002ZM61 138.502C61.8284 138.502 62.5 137.83 62.5 137.002C62.5 136.174 61.8284 135.502 61 135.502C60.1716 135.502 59.5 136.174 59.5 137.002C59.5 137.83 60.1716 138.502 61 138.502ZM68.5 137.002C68.5 136.174 67.8284 135.502 67 135.502C66.1716 135.502 65.5 136.174 65.5 137.002C65.5 137.83 66.1716 138.502 67 138.502C67.8284 138.502 68.5 137.83 68.5 137.002Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="53 197 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M63.5 200.5C67.2864 200.5 70.5 203.776 70.5 208C70.5 212.224 67.2864 215.5 63.5 215.5C59.7136 215.5 56.5 212.224 56.5 208C56.5 203.776 59.7136 200.5 63.5 200.5Z"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        d="M65.999 209.004L71.999 215.004"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HelpIcon({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="50 842 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M64.0008 844.57C57.6923 844.57 52.5723 849.69 52.5723 855.999C52.5723 862.307 57.6923 867.427 64.0008 867.427C70.3094 867.427 75.4294 862.307 75.4294 855.999C75.4294 849.69 70.3094 844.57 64.0008 844.57ZM65.1437 863.999H62.858V861.713H65.1437V863.999ZM67.5094 855.142L66.4808 856.193C65.658 857.027 65.1437 857.713 65.1437 859.427H62.858V858.856C62.858 857.599 63.3723 856.456 64.1951 855.622L65.6123 854.182C66.0351 853.77 66.2866 853.199 66.2866 852.57C66.2866 851.313 65.258 850.285 64.0008 850.285C62.7437 850.285 61.7151 851.313 61.7151 852.57H59.4294C59.4294 850.045 61.4751 847.999 64.0008 847.999C66.5266 847.999 68.5723 850.045 68.5723 852.57C68.5723 853.576 68.1608 854.49 67.5094 855.142Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="50 902 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M64.0124 912.749C63.2115 912.749 62.4615 913.06 61.8937 913.628C61.3285 914.196 61.0151 914.946 61.0151 915.747C61.0151 916.548 61.3285 917.298 61.8937 917.865C62.4615 918.431 63.2115 918.744 64.0124 918.744C64.8133 918.744 65.5633 918.431 66.1312 917.865C66.6964 917.298 67.0098 916.548 67.0098 915.747C67.0098 914.946 66.6964 914.196 66.1312 913.628C65.8538 913.348 65.5237 913.127 65.16 912.976C64.7962 912.825 64.4062 912.748 64.0124 912.749ZM75.0562 919.057L73.3044 917.56C73.3874 917.051 73.4303 916.532 73.4303 916.015C73.4303 915.498 73.3874 914.975 73.3044 914.469L75.0562 912.972C75.1885 912.858 75.2832 912.708 75.3277 912.539C75.3722 912.371 75.3644 912.193 75.3053 912.029L75.2812 911.959C74.7991 910.611 74.0767 909.361 73.149 908.271L73.1008 908.215C72.9882 908.082 72.838 907.987 72.6702 907.941C72.5024 907.896 72.3247 907.903 72.1606 907.96L69.9856 908.734C69.1821 908.075 68.2874 907.556 67.3178 907.194L66.8973 904.92C66.8655 904.749 66.7824 904.591 66.659 904.468C66.5355 904.345 66.3776 904.263 66.2062 904.232L66.1339 904.218C64.741 903.966 63.2731 903.966 61.8803 904.218L61.808 904.232C61.6365 904.263 61.4786 904.345 61.3552 904.468C61.2317 904.591 61.1486 904.749 61.1169 904.92L60.6937 907.205C59.7332 907.569 58.8385 908.088 58.0446 908.74L55.8535 907.96C55.6895 907.902 55.5117 907.895 55.3438 907.941C55.1758 907.986 55.0257 908.082 54.9133 908.215L54.8651 908.271C53.9391 909.363 53.2169 910.612 52.733 911.959L52.7089 912.029C52.5883 912.364 52.6874 912.739 52.958 912.972L54.7312 914.485C54.6481 914.989 54.608 915.503 54.608 916.012C54.608 916.526 54.6481 917.04 54.7312 917.539L52.9633 919.052C52.831 919.165 52.7363 919.316 52.6918 919.485C52.6473 919.653 52.6551 919.831 52.7142 919.995L52.7383 920.065C53.2231 921.412 53.9383 922.657 54.8705 923.753L54.9187 923.809C55.0313 923.942 55.1815 924.037 55.3493 924.082C55.5171 924.128 55.6948 924.121 55.8589 924.064L58.0499 923.284C58.8481 923.94 59.7374 924.46 60.699 924.819L61.1223 927.104C61.154 927.275 61.2371 927.433 61.3605 927.556C61.484 927.679 61.6419 927.761 61.8133 927.792L61.8856 927.806C63.2922 928.059 64.7327 928.059 66.1392 927.806L66.2115 927.792C66.383 927.761 66.5409 927.679 66.6643 927.556C66.7878 927.433 66.8709 927.275 66.9026 927.104L67.3231 924.83C68.2928 924.465 69.1874 923.948 69.991 923.29L72.166 924.064C72.33 924.122 72.5078 924.128 72.6757 924.083C72.8437 924.038 72.9938 923.942 73.1062 923.809L73.1544 923.753C74.0865 922.652 74.8017 921.412 75.2865 920.065L75.3106 919.995C75.4258 919.663 75.3267 919.29 75.0562 919.057ZM64.0124 920.456C61.4115 920.456 59.3035 918.348 59.3035 915.747C59.3035 913.146 61.4115 911.038 64.0124 911.038C66.6133 911.038 68.7214 913.146 68.7214 915.747C68.7214 918.348 66.6133 920.456 64.0124 920.456Z"
        fill="currentColor"
      />
    </svg>
  );
}

/* ─── Sidebar Config ─── */

const sidebarTopIcons: {
  id: SidebarTab;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'edit', icon: EditIcon },
  { id: 'robot', icon: RobotIcon },
  { id: 'search', icon: SearchIcon },
];

/* ─── Main Component ─── */

interface StudyLeftPanelProps {
  model: Model;
  notes: string;
  onNotesChange: (notes: string) => void;
}

export function StudyLeftPanel({
  model,
  notes,
  onNotesChange,
}: StudyLeftPanelProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SidebarTab>('edit');
  const [keywords, setKeywords] = useState<string[]>([
    '에너지 변환 원리',
    '직선 운동과 회전 운동',
    '힘과 토크 전달 원리',
    '정밀 가공 기술과 소재 특성',
  ]);

  const removeKeyword = (index: number) => {
    setKeywords((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <aside className="h-full flex">
      {/* Icon Strip */}
      <div className="w-[64px] shrink-0 flex flex-col justify-between border-r border-border bg-[#080d1a]">
        <div className="flex flex-col items-center pt-2">
          {sidebarTopIcons.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="w-[64px] h-[64px] flex items-center justify-center transition-colors relative"
              >
                {/* Active background */}
                {isActive && (
                  <div className="absolute inset-2 rounded-xl bg-[#34415C]/50 shadow-[3px_3px_30px_rgba(30,64,175,0.15),-3px_-3px_30px_rgba(30,64,175,0.25)]" />
                )}
                <item.icon
                  className={cn(
                    'relative z-10',
                    isActive
                      ? 'text-white'
                      : 'text-white/80 hover:text-white'
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

      {/* Content Panel */}
      <div
        className="w-[394px] shrink-0 flex flex-col overflow-hidden rounded-r-[20px] border-y border-r border-[#595959]/50"
        style={{
          background:
            'linear-gradient(180deg, rgba(7, 11, 20, 0.2) 0%, rgba(4, 10, 46, 0.16) 100%)',
        }}
      >
        {/* Back Button */}
        <div className="px-5 pt-5">
          <button
            onClick={() => router.push('/')}
            className="flex items-center text-white/90 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
            <span className="text-sm ml-0.5">Back</span>
          </button>
        </div>

        {/* Model Title */}
        <div className="px-6 mt-5">
          <h1 className="text-xl font-bold text-white leading-tight">
            {model.nameKo}
          </h1>
        </div>

        {/* Category */}
        <div className="px-6 mt-5">
          <div className="flex items-center gap-6 text-sm">
            <span className="text-white/50">분류</span>
            <span className="text-white">기계공학</span>
          </div>
        </div>

        {/* Keywords */}
        <div className="px-6 mt-5">
          <p className="text-sm text-white/50 mb-3">주요 키워드</p>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 h-[26px] px-3 rounded-full text-xs text-white bg-[#60A5FA]/50"
              >
                {keyword}
                <button
                  onClick={() => removeKeyword(index)}
                  className="hover:text-white/60 transition-colors shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Section Header */}
        <div className="px-6 mt-8 mb-3">
          <h2 className="text-lg font-bold text-white">학습 메모</h2>
        </div>

        {/* Bordered Memo Area */}
        <div className="px-5 flex-1 min-h-0">
          <div className="h-full rounded-xl border border-[#595959]/50 p-5 overflow-auto">
            <textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="크랭크샤프트의 회전 운동이 커넥팅 로드를 통해 피스톤의 왕복 운동으로 변환되는 과정을 3D로 확인합니다. 각 부품의 역할과 상호작용을 학습하며 메모를 남겨 보세요."
              className="w-full h-full bg-transparent text-sm text-white/70 placeholder:text-[#595959] focus:outline-none resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Bottom Action Button */}
        <div className="p-5">
          <button className="w-full h-[68px] rounded-xl bg-[#1E40AF] hover:bg-[#1E3A8A] active:bg-[#1e3580] text-white font-medium transition-colors flex items-center justify-center">
            학습하기 퀴즈 PDF 생성하기
          </button>
        </div>
      </div>
    </aside>
  );
}
