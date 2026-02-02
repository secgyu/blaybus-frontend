'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import {
  ArrowRight,
  BookOpen,
  Cpu,
  GraduationCap,
  Layers,
  Lightbulb,
  Loader2,
  MessageSquare,
  Microscope,
  MousePointerClick,
  RotateCcw,
  Target,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';

import { Header } from '@/components/header';
import { ModelCard } from '@/components/model-card';
import { type ModelSummary, fetchModels } from '@/lib/api';

export default function HomePage() {
  const [models, setModels] = useState<ModelSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadModels() {
      try {
        const data = await fetchModels();
        setModels(data);
      } catch (err) {
        console.error('Failed to fetch models:', err);
        setError('모델 목록을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
    loadModels();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />

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

        <section className="relative py-20 px-6 bg-card/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                누구를 위한 플랫폼인가요?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                SIMVEX는 공학과 과학기술 분야를 학습하는 모든 분들을 위해
                만들어졌습니다
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-panel p-6 text-center hover:border-primary/50 transition-colors group">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <GraduationCap className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">공대생</h3>
                <p className="text-sm text-muted-foreground">
                  기계공학, 자동차공학 등 전공 학습에 필요한 부품 구조 이해
                </p>
              </div>

              <div className="glass-panel p-6 text-center hover:border-primary/50 transition-colors group">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Microscope className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  과학기술 학습자
                </h3>
                <p className="text-sm text-muted-foreground">
                  기계 원리에 관심 있는 일반인과 자기주도 학습자
                </p>
              </div>

              <div className="glass-panel p-6 text-center hover:border-primary/50 transition-colors group">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Wrench className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  현장 엔지니어
                </h3>
                <p className="text-sm text-muted-foreground">
                  신입 교육이나 복습이 필요한 실무 엔지니어
                </p>
              </div>

              <div className="glass-panel p-6 text-center hover:border-primary/50 transition-colors group">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">교육자</h3>
                <p className="text-sm text-muted-foreground">
                  공학 수업에 시각 자료가 필요한 교수님과 강사분
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="relative py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                왜 <span className="text-primary">SIMVEX</span>인가요?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                교과서만으로는 이해하기 어려웠던 복잡한 기계 구조를
                <br className="hidden md:block" />
                3D 인터랙션과 AI의 도움으로 직관적으로 학습할 수 있습니다
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass-panel p-8 hover:border-primary/50 transition-all hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <Layers className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  3D 분해/조립 뷰
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  실제 CAD 소프트웨어처럼 엔지니어링 부품을 분해하고 조립하세요.
                  슬라이더로 분해 정도를 조절하며 내부 구조를 관찰할 수
                  있습니다.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    분해 슬라이더로 단계별 관찰
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    360도 자유로운 회전
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    줌인/줌아웃으로 세부 관찰
                  </li>
                </ul>
              </div>

              <div className="glass-panel p-8 hover:border-primary/50 transition-all hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <Cpu className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  AI 학습 어시스턴트
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  현재 보고 있는 모델의 맥락을 이해하는 AI가 궁금한 점을 바로
                  해결해드립니다. 부품의 역할, 재료, 작동 원리를 질문하세요.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    모델별 맞춤 응답
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    한국어 자연어 대화
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    심화 학습 유도
                  </li>
                </ul>
              </div>

              <div className="glass-panel p-8 hover:border-primary/50 transition-all hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  인터랙티브 학습
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  클릭하고, 회전하고, 확대하며 직접 체험하는 능동적 학습.
                  수동적인 교재 학습을 넘어 직접 조작하며 이해도를 높이세요.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    부품 클릭으로 상세 정보
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    하이라이트 시각 효과
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    직관적인 UI/UX
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="relative py-20 px-6 bg-card/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                이렇게 학습하세요
              </h2>
              <p className="text-muted-foreground">
                간단한 3단계로 기계 구조 학습을 시작할 수 있습니다
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="relative text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary">
                  <MousePointerClick className="w-7 h-7 text-primary" />
                </div>
                <div
                  className="absolute top-8 left-1/2 w-full h-0.5 bg-linear-to-r from-transparent via-border to-transparent hidden md:block"
                  style={{ transform: 'translateX(50%)' }}
                />
                <div className="text-sm text-primary font-medium mb-2">
                  STEP 1
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  모델 선택
                </h3>
                <p className="text-muted-foreground">
                  엔진, 로봇팔, 서스펜션 등<br />
                  학습하고 싶은 모델을 선택하세요
                </p>
              </div>

              <div className="relative text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary">
                  <RotateCcw className="w-7 h-7 text-primary" />
                </div>
                <div
                  className="absolute top-8 left-1/2 w-full h-0.5 bg-linear-to-r from-transparent via-border to-transparent hidden md:block"
                  style={{ transform: 'translateX(50%)' }}
                />
                <div className="text-sm text-primary font-medium mb-2">
                  STEP 2
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  3D 탐색
                </h3>
                <p className="text-muted-foreground">
                  회전, 확대, 분해하며
                  <br />
                  구조를 직접 탐색하세요
                </p>
              </div>

              <div className="relative text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary">
                  <MessageSquare className="w-7 h-7 text-primary" />
                </div>
                <div className="text-sm text-primary font-medium mb-2">
                  STEP 3
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  AI와 학습
                </h3>
                <p className="text-muted-foreground">
                  궁금한 점을 AI에게 질문하고
                  <br />
                  심화 학습을 진행하세요
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="relative py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  교과서로는 부족했던
                  <br />
                  <span className="text-primary">공학 학습의 새로운 방식</span>
                </h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  2D 도면과 텍스트만으로는 복잡한 기계 구조를 이해하기
                  어렵습니다. SIMVEX는 실제 CAD 모델을 기반으로 한 3D 시각화와
                  AI 어시스턴트를 통해 직관적이고 효과적인 학습 경험을
                  제공합니다.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Target className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        목표 지향적 학습
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        각 모델별 학습 목표와 핵심 포인트를 명확히 제시
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        학습자 중심 설계
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        공대생의 실제 학습 패턴을 분석해 최적화된 UX 제공
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Lightbulb className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        심화 학습 유도
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        AI가 관련 개념과 심화 주제를 자연스럽게 연결
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-panel p-8 lg:p-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
                    <div className="text-4xl">🎓</div>
                    <div>
                      <div className="font-medium text-foreground">
                        기계공학 전공생
                      </div>
                      <div className="text-sm text-muted-foreground">
                        "시험 전에 엔진 구조 한번 돌려보니까 확 이해됐어요"
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
                    <div className="text-4xl">🔧</div>
                    <div>
                      <div className="font-medium text-foreground">
                        자동차공학 학습자
                      </div>
                      <div className="text-sm text-muted-foreground">
                        "서스펜션 작동 원리를 처음으로 제대로 이해했습니다"
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
                    <div className="text-4xl">📚</div>
                    <div>
                      <div className="font-medium text-foreground">
                        공학 교수님
                      </div>
                      <div className="text-sm text-muted-foreground">
                        "수업 자료로 활용하니 학생들 집중도가 확 올랐어요"
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

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

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <span className="ml-3 text-muted-foreground">
                  모델을 불러오는 중...
                </span>
              </div>
            ) : error ? (
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
      </main>

      <footer className="border-t border-border py-8 px-6 bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-primary glow-cyan" />
              <span className="font-semibold text-foreground">SIMVEX</span>
              <span className="text-muted-foreground text-sm">
                공학 교육을 위한 3D 시각화 플랫폼
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="font-mono">v1.0.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
