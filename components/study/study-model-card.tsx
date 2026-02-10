'use client';

import Image from 'next/image';
import Link from 'next/link';

import type { ComingSoonItem } from '@/lib/constants/coming-soon-models';
import type { ModelSummary } from '@/types/api';

const MODEL_IMAGE_MAP: Record<string, string> = {
  v4_engine: 'v4',
  suspension: 'suspension',
  robot_arm: 'robotarm',
  robot_gripper: 'robotgripper',
  drone: 'drone',
};

function ChevronRight() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      className="shrink-0"
    >
      <path
        d="M14.9993 12.9987C14.9998 13.2324 14.9184 13.4588 14.7693 13.6387L9.7693 19.6387C9.59956 19.843 9.35565 19.9714 9.09122 19.9958C8.8268 20.0201 8.56352 19.9385 8.3593 19.7687C8.15508 19.599 8.02666 19.3551 8.00228 19.0907C7.9779 18.8262 8.05956 18.563 8.2293 18.3587L12.7093 12.9987L8.3893 7.63875C8.30623 7.53646 8.2442 7.41876 8.20677 7.29242C8.16934 7.16609 8.15724 7.03359 8.17118 6.90257C8.18512 6.77154 8.22482 6.64456 8.28799 6.52892C8.35117 6.41328 8.43657 6.31127 8.5393 6.22875C8.64212 6.13717 8.76275 6.06781 8.89362 6.02502C9.02449 5.98222 9.16279 5.96692 9.29986 5.98006C9.43692 5.99321 9.56979 6.03451 9.69015 6.1014C9.81051 6.16828 9.91575 6.2593 9.9993 6.36875L14.8293 12.3687C14.9548 12.5538 15.0147 12.7756 14.9993 12.9987Z"
        fill="#FAFAFA"
      />
    </svg>
  );
}

function BoxIcon({ className }: { className?: string }) {
  return (
    <svg
      width="28"
      height="28"
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
  const imageSlug = MODEL_IMAGE_MAP[model.modelId];

  return (
    <Link href={`/study/${model.modelId}`} className="group block w-full">
      <div
        className="box-border flex flex-col p-4 lg:p-5 gap-3 w-full aspect-52/65 border-2 border-transparent hover:border-[#1E40AF] rounded-2xl lg:rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)]"
        style={{
          background:
            'linear-gradient(180deg, rgba(7, 11, 20, 0.8) 0%, rgba(4, 10, 46, 0.64) 100%)',
        }}
      >
        {/* 모델명 */}
        <h3 className="text-lg lg:text-xl font-bold text-white leading-snug">
          {formatModelName(model.modelId)}
        </h3>

        {/* 설명 + chevron */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs lg:text-sm text-[#B8B8B8]/60 line-clamp-2 leading-relaxed">
            {model.overview}
          </p>
          <ChevronRight />
        </div>

        {/* 모델 이미지 */}
        <div className="flex-1 w-full flex items-center justify-center min-h-0">
          {imageSlug ? (
            <div className="relative w-full h-full">
              <Image
                src={`/study/${imageSlug}.png`}
                alt={formatModelName(model.modelId)}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-contain transition-opacity duration-300 group-hover:opacity-0"
              />
              <Image
                src={`/study/${imageSlug}_hover.png`}
                alt={`${formatModelName(model.modelId)} hover`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 rounded-xl bg-[#1E3A8A]/20 flex items-center justify-center">
                <BoxIcon className="text-[#3B82F6]/40" />
              </div>
              <span className="text-xs text-[#595959]">3D Model</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export function ComingSoonCard({ model }: { model: ComingSoonItem }) {
  return (
    <Link href={`/study/${model.id}`} className="group block w-full">
      <div
        className="box-border flex flex-col p-4 lg:p-5 gap-3 w-full aspect-52/65 border-2 border-transparent hover:border-[#1E40AF] rounded-2xl lg:rounded-3xl overflow-hidden opacity-70 hover:opacity-85 transition-all duration-300"
        style={{
          background:
            'linear-gradient(180deg, rgba(7, 11, 20, 0.8) 0%, rgba(4, 10, 46, 0.64) 100%)',
        }}
      >
        {/* 모델명 */}
        <h3 className="text-lg lg:text-xl font-bold text-white/80 leading-snug">
          {model.title}
        </h3>

        {/* 설명 + chevron */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs lg:text-sm text-[#B8B8B8]/40 line-clamp-2 leading-relaxed">
            {model.description}
          </p>
          <ChevronRight />
        </div>

        {/* 플레이스홀더 */}
        <div className="flex-1 w-full flex items-center justify-center min-h-0">
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
