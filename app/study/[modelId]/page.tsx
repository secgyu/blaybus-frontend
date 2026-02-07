'use client';

import { use, useCallback, useEffect, useState } from 'react';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ArrowLeft, Loader2 } from 'lucide-react';

import { StudyHeader } from '@/components/study-header';
import { StudyLeftPanel } from '@/components/viewer/study-left-panel';
import { StudyRightPanel } from '@/components/viewer/study-right-panel';
import { fetchViewerData } from '@/lib/api';
import { toViewerModel } from '@/lib/transform';
import type { Model } from '@/lib/types';
import { useViewerStore } from '@/store/viewer-store';

const COMING_SOON_IDS: Record<string, string> = {
  bio_dna_helix: '생명공학',
  bio_cell_structure: '생명공학',
  bio_protein_folding: '생명공학',
  med_artificial_joint: '의공학',
  med_prosthetic_hand: '의공학',
  med_stent: '의공학',
};

const Scene = dynamic(
  () =>
    import('@/components/viewer/scene').then((mod) => ({ default: mod.Scene })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-[#070b14] pl-[394px] pr-[406px]">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <span className="text-primary">3D 뷰어 로딩 중...</span>
        </div>
      </div>
    ),
  }
);

// System prompts for AI chat
const systemPrompts: Record<string, string> = {
  v4_engine: `당신은 SIMVEX의 공학 교육 어시스턴트입니다. 현재 사용자는 V4 실린더 엔진을 학습하고 있습니다.

크랭크샤프트의 회전 운동이 커넥팅 로드를 통해 피스톤의 왕복 운동으로 변환되는 과정을 3D로 확인합니다.

V4 엔진은 4개의 실린더가 V자 형태로 배치된 내연기관입니다. 주요 작동 원리:
1. 흡입 행정: 피스톤이 하강하며 공기-연료 혼합물 흡입
2. 압축 행정: 피스톤이 상승하며 혼합물 압축
3. 폭발 행정: 점화 플러그에 의한 연소로 피스톤 하강
4. 배기 행정: 피스톤 상승으로 연소 가스 배출

학생들에게 친절하고 명확하게 설명해주세요. 한국어로 답변하세요.`,
  suspension: `당신은 SIMVEX의 공학 교육 어시스턴트입니다. 현재 사용자는 서스펜션을 학습하고 있습니다.

서스펜션의 특징:
- 스프링이 충격을 흡수하고 차체를 지지
- 쇼크업소버(댐퍼)가 진동을 감쇠
- 차량의 승차감과 조종 안정성에 핵심적 역할
- 다양한 형식: 맥퍼슨, 더블위시본, 멀티링크 등

학생들에게 친절하고 명확하게 설명해주세요. 한국어로 답변하세요.`,
  drone: `당신은 SIMVEX의 공학 교육 어시스턴트입니다. 현재 사용자는 쿼드콥터 드론을 학습하고 있습니다.

드론의 비행 원리:
- 4개의 모터가 프로펠러를 회전시켜 양력 생성
- 대각선 모터는 같은 방향, 인접 모터는 반대 방향 회전
- 모터 속도 차이로 롤, 피치, 요 제어
- 비행 컨트롤러의 PID 제어로 안정적 비행

학생들에게 친절하고 명확하게 설명해주세요. 한국어로 답변하세요.`,
  robot_arm: `당신은 SIMVEX의 공학 교육 어시스턴트입니다. 현재 사용자는 6축 산업용 로봇팔을 학습하고 있습니다.

6축 로봇팔의 특징:
- 6개의 회전 관절로 6 자유도(DOF) 구현
- 역기구학으로 목표 위치/자세에 필요한 관절 각도 계산
- 서보 모터와 감속기로 정밀한 위치 제어
- 주로 용접, 조립, 도장 등 산업 자동화에 사용

학생들에게 친절하고 명확하게 설명해주세요. 한국어로 답변하세요.`,
  robot_gripper: `당신은 SIMVEX의 공학 교육 어시스턴트입니다. 현재 사용자는 로봇 그리퍼를 학습하고 있습니다.

그리퍼의 종류와 특징:
- 2핑거 그리퍼: 가장 일반적, 평행 또는 각도 방식
- 3핑거 그리퍼: 원형 물체에 적합
- 진공 그리퍼: 평면 물체 핸들링
- 소프트 그리퍼: 민감한 물체용

학생들에게 친절하고 명확하게 설명해주세요. 한국어로 답변하세요.`,
  leaf_spring: `당신은 SIMVEX의 공학 교육 어시스턴트입니다. 현재 사용자는 판스프링 서스펜션을 학습하고 있습니다.

판스프링의 특징:
- 여러 겹의 강판이 겹쳐진 구조
- 스프링과 서스펜션 링크 역할 동시 수행
- 높은 하중 용량으로 트럭, 버스에 주로 사용
- 판 사이 마찰로 자체 감쇠 효과

학생들에게 친절하고 명확하게 설명해주세요. 한국어로 답변하세요.`,
  machine_vice: `당신은 SIMVEX의 공학 교육 어시스턴트입니다. 현재 사용자는 공작기계 바이스를 학습하고 있습니다.

바이스의 특징:
- 리드 스크류의 나사 원리로 강한 클램핑력 발생
- ACME 나사는 사다리꼴 단면으로 높은 하중 전달
- 정밀 바이스는 ±0.01mm 정확도
- 스위블 베이스로 각도 조절 가능한 모델도 있음

학생들에게 친절하고 명확하게 설명해주세요. 한국어로 답변하세요.`,
};

interface PageProps {
  params: Promise<{ modelId: string }>;
}

export default function StudyPage({ params }: PageProps) {
  const { modelId } = use(params);

  // Coming soon 모델인 경우 별도 UI 렌더링
  if (COMING_SOON_IDS[modelId]) {
    return <ComingSoonPage modelId={modelId} />;
  }

  return <ViewerPage modelId={modelId} />;
}

/* ─── Coming Soon Page ─── */

function ComingSoonPage({ modelId }: { modelId: string }) {
  const title = COMING_SOON_IDS[modelId];

  return (
    <div className="h-screen bg-[#070B14] relative overflow-hidden">
      {/* 흐릿한 배경 (가짜 뷰어 레이아웃) */}
      <div className="absolute inset-0 blur-sm brightness-[0.3] pointer-events-none select-none">
        {/* 헤더 */}
        <div className="h-14 bg-[#0D1117] border-b border-[#1E3A8A]/20 flex items-center px-6">
          <div className="w-24 h-4 rounded bg-[#1E3A8A]/30" />
          <div className="ml-8 flex gap-4">
            <div className="w-16 h-3 rounded bg-[#1E3A8A]/20" />
            <div className="w-16 h-3 rounded bg-[#1E3A8A]/20" />
            <div className="w-16 h-3 rounded bg-[#1E3A8A]/20" />
          </div>
        </div>

        <div className="flex h-[calc(100%-56px)]">
          {/* 좌측 패널 */}
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
            <span className="text-xs text-[#3B82F6]">{title}</span>
          </div>

          <h2 className="text-2xl font-bold text-[#FAFAFA] mb-3">
            추후 업데이트될 예정입니다.
          </h2>
          <p className="text-sm text-[#FAFAFA]/40 mb-10 max-w-md leading-relaxed">
            현재 {title} 분야의 3D 모델을 준비하고 있습니다.
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

function ViewerPage({ modelId }: { modelId: string }) {
  const [model, setModel] = useState<Model | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    async function loadModel() {
      try {
        const data = await fetchViewerData(modelId);
        const systemPrompt =
          systemPrompts[modelId] ||
          '당신은 SIMVEX의 공학 교육 어시스턴트입니다. 한국어로 친절하게 답변해주세요.';
        console.log('data : ', data);
        const viewerModel = toViewerModel(data, systemPrompt);
        setModel(viewerModel);
      } catch (error) {
        console.error('Failed to load model:', error);
        setLoadError('모델을 찾을 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    }
    loadModel();
  }, [modelId]);

  const store = useViewerStore(modelId);
  const selectedPartId = store((state) => state.selectedPartId);
  const explodeValue = store((state) => state.explodeValue);
  const notes = store((state) => state.notes);
  const isHydrated = store((state) => state.isHydrated);
  const setSelectedPartId = store((state) => state.setSelectedPartId);
  const setExplodeValue = store((state) => state.setExplodeValue);
  const setNotes = store((state) => state.setNotes);

  const [hoveredPartId, setHoveredPartId] = useState<string | null>(null);
  const [isSceneReady, setIsSceneReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  useEffect(() => {
    if (isHydrated) return;

    const timeout = setTimeout(() => {
      const currentState = store.getState();
      if (!currentState.isHydrated) {
        currentState.setHydrated(true);
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [store, isHydrated]);

  useEffect(() => {
    if (model && isHydrated && !isSceneReady) {
      const timeout = setTimeout(() => {
        setIsSceneReady(true);
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [model, isHydrated, isSceneReady]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <span className="text-primary">모델을 불러오는 중...</span>
        </div>
      </div>
    );
  }

  if (loadError || !model) {
    notFound();
  }

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {!isFullscreen && <StudyHeader />}

      <div className="flex-1 flex overflow-hidden">
        {!isFullscreen && (
          <StudyLeftPanel
            model={model}
            modelId={modelId}
            notes={notes}
            onNotesChange={setNotes}
            selectedPart={
              selectedPartId
                ? (model.parts.find((p) => p.id === selectedPartId) ?? null)
                : null
            }
          />
        )}

        <main className="flex-1 relative min-w-[400px]">
          {isSceneReady ? (
            <Scene
              model={model}
              explodeValue={explodeValue}
              selectedPartId={selectedPartId}
              onPartClick={setSelectedPartId}
              onPartHover={setHoveredPartId}
              onExplodeChange={setExplodeValue}
              isFullscreen={isFullscreen}
              onToggleFullscreen={toggleFullscreen}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#070b14] pl-[394px] pr-[406px]">
              <div className="flex items-center gap-3">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                <span className="text-primary">3D 뷰어 로딩 중...</span>
              </div>
            </div>
          )}

          {!isFullscreen && hoveredPartId && !selectedPartId && (
            <PartTooltip
              part={model.parts.find((p) => p.id === hoveredPartId)!}
            />
          )}

          {!isFullscreen && (
            <div className="absolute top-3 right-3 bottom-3 w-[394px] z-10">
              <StudyRightPanel
                model={model}
                selectedPartId={selectedPartId}
                onPartSelect={setSelectedPartId}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function PartTooltip({ part }: { part: { nameKo: string; role: string } }) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 glass-panel px-4 py-2 pointer-events-none z-10">
      <p className="text-sm font-medium text-primary">{part.nameKo}</p>
      <p className="text-xs text-muted-foreground max-w-xs truncate">
        {part.role}
      </p>
    </div>
  );
}
