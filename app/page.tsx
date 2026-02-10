import Link from 'next/link';

import { ArrowRight } from 'lucide-react';

import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { FeaturesSection } from '@/components/home/features-section';
import { StepsSection } from '@/components/home/steps-section';
import { TargetAudienceSection } from '@/components/home/target-audience-section';
import { WhySimvexSection } from '@/components/home/why-simvex-section';
import { ModelCard } from '@/components/model-card';
import { fetchModelsServer } from '@/lib/api';
import type { ModelSummary } from '@/types/api';

export default async function HomePage() {
  let models: ModelSummary[] = [];
  let error: string | null = null;

  try {
    models = await fetchModelsServer();
  } catch (err) {
    console.error('Failed to fetch models:', err);
    error = '모델 목록을 불러오는데 실패했습니다.';
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />

        <HeroSection />
        <TargetAudienceSection />
        <FeaturesSection />
        <StepsSection />
        <WhySimvexSection />
        <ModelsSection models={models} error={error} />
      </main>

      <Footer />
    </div>
  );
}

function HeroSection() {
  return (
    <div className="max-w-6xl mx-auto text-center">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-8">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-sm text-muted-foreground">
          공학 교육을 위한 3D 시각화 플랫폼
        </span>
      </div>

      <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 tracking-tight">
        <span className="text-primary">SIMVEX</span>
      </h1>

      <p className="text-2xl md:text-3xl text-foreground/90 mb-4 font-medium">
        복잡한 기계 구조를 <span className="text-primary">3D로 학습</span>
        하세요
      </p>

      <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
        공대생과 과학기술 학습자를 위한 인터랙티브 학습 플랫폼입니다.
        <br className="hidden md:block" />
        실제 엔지니어링 부품을 분해하고 조립하며 작동 원리를 직접 체험하고,
        <br className="hidden md:block" />
        AI 어시스턴트와 함께 깊이 있는 학습을 경험하세요.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
        <Link
          href="/study"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground rounded-full font-semibold text-lg hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/25"
        >
          학습 시작하기
          <ArrowRight className="w-5 h-5" />
        </Link>
        <a
          href="#features"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-secondary text-foreground rounded-full font-medium text-lg border border-border hover:bg-muted transition-colors"
        >
          더 알아보기
        </a>
      </div>
    </div>
  );
}

function ModelsSection({
  models,
  error,
}: {
  models: ModelSummary[];
  error: string | null;
}) {
  return (
    <section className="relative py-20 px-6 bg-card/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            지금 바로 학습을 시작하세요
          </h2>
          <p className="text-muted-foreground">
            다양한 엔지니어링 모델을 선택하고 3D로 탐색해보세요
          </p>
        </div>

        {error ? (
          <div className="text-center py-12">
            <p className="text-destructive">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {models.map((model) => (
              <ModelCard key={model.modelId} model={model} />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            href="/study"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-all hover:scale-105"
          >
            모든 모델 보기
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
