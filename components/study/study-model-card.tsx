'use client';

import Link from 'next/link';

import { ArrowRight } from 'lucide-react';

import type { ComingSoonItem } from '@/lib/constants/coming-soon-models';
import type { ModelSummary } from '@/types/model';

function BoxIcon({ className }: { className?: string }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <polyline
        points="3.27 6.96 12 12.01 20.73 6.96"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <line
        x1="12"
        y1="22.08"
        x2="12"
        y2="12"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function formatModelName(modelId: string): string {
  return modelId.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function StudyModelCard({ model }: { model: ModelSummary }) {
  return (
    <Link href={`/study/${model.modelId}`} className="group block">
      <div className="rounded-2xl overflow-hidden border border-[#1E3A8A]/30 hover:border-[#3B82F6]/50 transition-all duration-300 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)]">
        <div className="relative p-6 pb-5 bg-linear-to-br from-[#1E40AF] to-[#2563EB]">
          <h3 className="text-lg font-bold text-white mb-1.5 leading-snug">
            {formatModelName(model.modelId)}
          </h3>
          <p className="text-xs text-white/60 line-clamp-2 pr-6 leading-relaxed">
            {model.overview}
          </p>
          <div className="absolute bottom-5 right-5 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
            <ArrowRight className="w-4 h-4 text-white/80" />
          </div>
        </div>

        <div className="aspect-4/3 bg-[#0D1117] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-2 rounded-xl bg-[#1E3A8A]/20 flex items-center justify-center">
              <BoxIcon className="text-[#3B82F6]/40" />
            </div>
            <span className="text-xs text-[#595959]">3D Model</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ComingSoonCard({ model }: { model: ComingSoonItem }) {
  return (
    <Link href={`/study/${model.id}`} className="group block">
      <div className="rounded-2xl overflow-hidden border border-[#1E3A8A]/30 hover:border-[#3B82F6]/30 transition-all duration-300 opacity-70 hover:opacity-85">
        <div className="relative p-6 pb-5 bg-linear-to-br from-[#1E3A8A]/60 to-[#1E40AF]/40">
          <h3 className="text-lg font-bold text-white/80 mb-1.5 leading-snug">
            {model.title}
          </h3>
          <p className="text-xs text-white/40 line-clamp-2 pr-6 leading-relaxed">
            {model.description}
          </p>
          <div className="absolute bottom-5 right-5 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
            <ArrowRight className="w-4 h-4 text-white/40" />
          </div>
        </div>

        <div className="aspect-4/3 bg-[#0D1117] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-2 rounded-xl bg-[#1E3A8A]/10 flex items-center justify-center">
              <BoxIcon className="text-[#3B82F6]/20" />
            </div>
            <span className="text-xs text-[#595959]/60">Coming Soon</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
