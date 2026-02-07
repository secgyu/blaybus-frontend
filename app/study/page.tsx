'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import Link from 'next/link';

import { ArrowRight, ChevronDown, Loader2 } from 'lucide-react';

import { SimvexLogo } from '@/components/study-header';
import { fetchModelsPage } from '@/lib/api';
import type { ModelSummary } from '@/types/model';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '#' },
  { label: 'Study', href: '/study' },
  { label: 'Community', href: '#' },
  { label: 'FAQ', href: '#' },
];

function StudyNav() {
  return (
    <header className="h-16 border-b border-[#1E3A8A]/20 bg-[#070B14] flex items-center justify-between px-8">
      <div className="flex items-center gap-10">
        <Link href="/" className="shrink-0">
          <SimvexLogo />
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-1 px-4 py-2 text-sm text-[#FAFAFA]/70 hover:text-[#FAFAFA] transition-colors"
            >
              {item.label}
              <ChevronDown className="w-3 h-3 opacity-50" />
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <button className="px-4 py-1.5 text-xs font-medium rounded-full bg-[#3B82F6] text-white">
          KOR
        </button>
        <button className="px-4 py-1.5 text-xs font-medium rounded-full border border-[#595959] text-[#FAFAFA]/60 hover:text-[#FAFAFA] transition-colors">
          ENG
        </button>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative px-8 py-12">
      <div className="max-w-[1200px] mx-auto">
        <div className="relative h-[200px] rounded-2xl overflow-hidden bg-linear-to-r from-[#1E40AF]/30 to-[#3B82F6]/10 border border-[#1E3A8A]/30 flex items-center justify-center">
          <div className="absolute inset-0 bg-[url('/assets/grid-pattern.svg')] opacity-10" />
          <div className="text-center relative z-10">
            <h1 className="text-3xl font-bold text-[#FAFAFA] mb-2">
              3D Engineering Models
            </h1>
            <p className="text-sm text-[#FAFAFA]/50">
              학습하고 싶은 모델을 선택하세요
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

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

function StudyModelCard({ model }: { model: ModelSummary }) {
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

interface ComingSoonItem {
  id: string;
  title: string;
  description: string;
}

function ComingSoonCard({ model }: { model: ComingSoonItem }) {
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

const BIO_ENGINEERING_MODELS: ComingSoonItem[] = [
  {
    id: 'bio_dna_helix',
    title: 'DNA 이중나선',
    description:
      'DNA 이중나선 구조의 3D 모델을 통해 뉴클레오타이드 배열과 수소결합 원리를 학습합니다.',
  },
  {
    id: 'bio_cell_structure',
    title: '세포 구조',
    description:
      '동물 세포의 내부 구조를 3D로 분해하여 소기관의 역할과 상호작용을 학습합니다.',
  },
  {
    id: 'bio_protein_folding',
    title: '단백질 접힘',
    description:
      '단백질의 1·2·3·4차 구조와 접힘 과정을 3D 시각화로 학습합니다.',
  },
];

const BIOMEDICAL_MODELS: ComingSoonItem[] = [
  {
    id: 'med_artificial_joint',
    title: '인공관절',
    description: '인공 슬관절의 구조와 삽입 메커니즘을 3D 분해도로 학습합니다.',
  },
  {
    id: 'med_prosthetic_hand',
    title: '의수 (보철물)',
    description: '전동 의수의 링크 메커니즘과 센서 배치를 3D로 학습합니다.',
  },
  {
    id: 'med_stent',
    title: '혈관 스텐트',
    description:
      '자가팽창형 혈관 스텐트의 구조와 혈관 내 확장 원리를 학습합니다.',
  },
];

const PAGE_SIZE = 6;

export default function StudyPage() {
  const [models, setModels] = useState<ModelSummary[]>([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const observerRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (isFetchingRef.current || !hasNext) return;
    isFetchingRef.current = true;
    setIsLoading(true);

    try {
      const data = await fetchModelsPage({ page, size: PAGE_SIZE });
      setModels((prev) => [...prev, ...data.models]);
      setHasNext(data.hasNext);
      setPage((prev) => prev + 1);
    } catch (err) {
      console.error('Failed to fetch models:', err);
      setError('모델 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
      isFetchingRef.current = false;
    }
  }, [page, hasNext]);

  useEffect(() => {
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNext && !isFetchingRef.current) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, hasNext]);

  return (
    <div className="min-h-screen bg-[#070B14]">
      <StudyNav />
      <HeroSection />

      <div className="max-w-[1200px] mx-auto px-8 pb-20 space-y-16">
        <section>
          <h2 className="text-2xl font-bold text-[#FAFAFA] mb-8">기계공학</h2>

          {isInitialLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" />
              <span className="ml-3 text-[#FAFAFA]/50">
                모델을 불러오는 중...
              </span>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-400">{error}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {models.map((model) => (
                  <StudyModelCard key={model.modelId} model={model} />
                ))}
              </div>

              <div ref={observerRef} className="h-10 mt-8">
                {isLoading && (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-[#3B82F6] animate-spin" />
                    <span className="ml-2 text-sm text-[#FAFAFA]/40">
                      더 불러오는 중...
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[#FAFAFA] mb-8">생명공학</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BIO_ENGINEERING_MODELS.map((model) => (
              <ComingSoonCard key={model.id} model={model} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[#FAFAFA] mb-8">의공학</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BIOMEDICAL_MODELS.map((model) => (
              <ComingSoonCard key={model.id} model={model} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
