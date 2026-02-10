'use client';

import { useInView } from 'react-intersection-observer';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Loader2 } from 'lucide-react';

import { Footer } from '@/components/footer';
import { SimvexLogo } from '@/components/study-header';
import { StudyModelCard } from '@/components/study/study-model-card';
import { useModels } from '@/hooks/use-models';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Study', href: '/study' },
];

function StudyNav() {
  const router = useRouter();

  return (
    <header className="h-[64px] bg-[#0a0f1a]/50 backdrop-blur-sm border-b border-[#595959]/30 flex items-end pl-6 pb-3">
      <div className="flex items-end gap-0">
        <button
          onClick={() => router.push('/')}
          className="cursor-pointer mb-[-4px] mr-[42px]"
        >
          <SimvexLogo />
        </button>

        {navItems.map((item) => {
          const isActive = item.label === 'Study';
          return (
            <Link
              key={item.label}
              href={item.href}
              className="relative flex flex-col items-center px-8"
            >
              <span
                className={`text-[18px] font-semibold tracking-wide pb-1.5 transition-colors ${
                  isActive
                    ? 'text-[#FAFAFA]'
                    : 'text-[#FAFAFA]/60 hover:text-[#FAFAFA]/80'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[2px] bg-[#2563EB] rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="px-6 md:px-12 lg:px-16 xl:px-20 pt-2">
      <div className="relative w-full mx-auto h-[35vh] min-h-[220px] max-h-[400px] rounded-3xl lg:rounded-[40px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/study.png')" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to left, rgba(7, 11, 20, 0.8), rgba(4, 10, 46, 0.64))',
          }}
        />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#FAFAFA] tracking-tight leading-tight mb-3">
            3D Engineering Viewer
          </h1>
          <p className="text-xs lg:text-sm text-[#B8B8B8] leading-relaxed">
            정밀하게 구현된 3D 엔지니어링 모델을 통해 구조와 작동 원리를 한눈에
            학습할 수 있습니다.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function StudyPage() {
  const {
    data: models,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useModels();

  const { ref } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
  });

  return (
    <div className="min-h-screen bg-[#070B14]">
      <StudyNav />
      <HeroSection />

      <div className="px-6 md:px-12 lg:px-16 xl:px-20 pb-16 pt-20 space-y-12">
        <section>
          <h2 className="text-2xl md:text-3xl lg:text-[2rem] font-bold text-[#FAFAFA] leading-tight mb-6">
            기계공학
          </h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
              <span className="ml-3 text-[#2563EB]/70">
                모델을 불러오는 중...
              </span>
            </div>
          ) : isError ? (
            <div className="text-center py-20">
              <p className="text-red-400">
                모델 목록을 불러오는데 실패했습니다.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4 lg:gap-5">
                {models?.map((model) => (
                  <StudyModelCard key={model.modelId} model={model} />
                ))}
              </div>

              <div ref={ref} className="h-10 mt-8">
                {isFetchingNextPage && (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-[#2563EB] animate-spin" />
                    <span className="ml-2 text-sm text-[#2563EB]/70">
                      더 불러오는 중...
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
}
