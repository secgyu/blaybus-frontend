'use client';

import Link from 'next/link';

import { ArrowLeft } from 'lucide-react';

interface ComingSoonPageProps {
  modelId: string;
  categoryTitle: string;
}

export function ComingSoonPage({
  modelId,
  categoryTitle,
}: ComingSoonPageProps) {
  return (
    <div className="h-screen bg-[#070B14] relative overflow-hidden">
      <div className="absolute inset-0 blur-sm brightness-[0.3] pointer-events-none select-none">
        <div className="h-14 bg-[#0D1117] border-b border-[#1E3A8A]/20 flex items-center px-6">
          <div className="w-24 h-4 rounded bg-[#1E3A8A]/30" />
          <div className="ml-8 flex gap-4">
            <div className="w-16 h-3 rounded bg-[#1E3A8A]/20" />
            <div className="w-16 h-3 rounded bg-[#1E3A8A]/20" />
            <div className="w-16 h-3 rounded bg-[#1E3A8A]/20" />
          </div>
        </div>

        <div className="flex h-[calc(100%-56px)]">
          <div className="w-[340px] bg-[#0B1120]/90 border-r border-[#1E3A8A]/15 p-6 shrink-0">
            <div className="space-y-4">
              <div className="w-32 h-5 rounded bg-[#1E3A8A]/20" />
              <div className="w-full h-3 rounded bg-[#1E3A8A]/10" />
              <div className="w-3/4 h-3 rounded bg-[#1E3A8A]/10" />
              <div className="w-full h-3 rounded bg-[#1E3A8A]/10" />
              <div className="mt-8 w-40 h-4 rounded bg-[#1E3A8A]/15" />
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg bg-[#1E3A8A]/5"
                  >
                    <div className="w-8 h-8 rounded bg-[#1E3A8A]/15 shrink-0" />
                    <div className="flex-1 space-y-1">
                      <div className="w-20 h-3 rounded bg-[#1E3A8A]/15" />
                      <div className="w-32 h-2 rounded bg-[#1E3A8A]/10" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 bg-[#070B14] relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-40 h-40 rounded-full bg-[#1E3A8A]/5 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-[#1E3A8A]/8" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-linear-to-t from-[#1E3A8A]/5 to-transparent" />
          </div>

          <div className="w-[394px] bg-[#0B1120]/90 border-l border-[#1E3A8A]/15 p-4 shrink-0">
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1 h-9 rounded-lg bg-[#1E3A8A]/15" />
                <div className="flex-1 h-9 rounded-lg bg-[#1E3A8A]/10" />
              </div>
              <div className="space-y-2 mt-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-lg bg-[#1E3A8A]/8" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/20 mb-6">
            <div className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse" />
            <span className="text-xs text-[#3B82F6]">{categoryTitle}</span>
          </div>

          <h2 className="text-2xl font-bold text-[#FAFAFA] mb-3">
            추후 업데이트될 예정입니다.
          </h2>
          <p className="text-sm text-[#FAFAFA]/40 mb-10 max-w-md leading-relaxed">
            현재 {categoryTitle} 분야의 3D 모델을 준비하고 있습니다.
            <br />
            빠른 시일 내에 제공될 예정이니 조금만 기다려주세요.
          </p>

          <Link
            href="/study"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#3B82F6] text-white text-sm font-medium hover:bg-[#2563EB] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            모델 목록으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
