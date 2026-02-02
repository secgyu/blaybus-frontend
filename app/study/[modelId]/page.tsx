'use client';

import { use, useCallback, useEffect, useState } from 'react';

import { notFound } from 'next/navigation';

import { Loader2 } from 'lucide-react';

import { Header } from '@/components/header';
import { LeftSidebar } from '@/components/viewer/left-sidebar';
import { RightSidebar } from '@/components/viewer/right-sidebar';
import { Scene } from '@/components/viewer/scene';
import { SearchBar } from '@/components/viewer/search-bar';
import { useViewerState } from '@/hooks/use-viewer-state';
import { fetchViewerData, sendChatMessage } from '@/lib/api';
import { toViewerModel } from '@/lib/transform';
import type { Model } from '@/lib/types';

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
  const [model, setModel] = useState<Model | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load model data from API
  useEffect(() => {
    async function loadModel() {
      try {
        const data = await fetchViewerData(modelId);
        const systemPrompt =
          systemPrompts[modelId] ||
          '당신은 SIMVEX의 공학 교육 어시스턴트입니다. 한국어로 친절하게 답변해주세요.';
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

  const {
    state,
    isLoaded,
    setExplodeValue,
    setSelectedPartId,
    setNotes,
    addChatMessage,
    clearChatHistory,
  } = useViewerState(modelId);

  const [showRightPanel, setShowRightPanel] = useState(true);
  const [hoveredPartId, setHoveredPartId] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const selectedPart = model?.parts.find((p) => p.id === state.selectedPartId);

  const handleSendMessage = useCallback(
    async (message: string) => {
      if (!model) return;

      // Add user message
      addChatMessage({ role: 'user', content: message });
      setIsAiLoading(true);

      try {
        // Build messages array for API
        const messages = [
          ...state.aiHistory.map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
          { role: 'user' as const, content: message },
        ];

        // Call the new API endpoint
        const response = await sendChatMessage(
          modelId,
          messages,
          selectedPart?.id
        );

        // Add assistant message
        if (response) {
          addChatMessage({ role: 'assistant', content: response });
        }
      } catch (error) {
        console.error('Chat error:', error);
        addChatMessage({
          role: 'assistant',
          content:
            '죄송합니다. 응답을 생성하는 중 오류가 발생했습니다. 다시 시도해주세요.',
        });
      } finally {
        setIsAiLoading(false);
      }
    },
    [model, modelId, state.aiHistory, selectedPart, addChatMessage]
  );

  const handleSearchSubmit = (query: string) => {
    handleSendMessage(query);
    setShowRightPanel(true);
  };

  // Show loading state
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

  // Show error or not found
  if (loadError || !model) {
    notFound();
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Header
        showCopilot
        onCopilotClick={() => setShowRightPanel(!showRightPanel)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <LeftSidebar
          model={model}
          selectedPartId={state.selectedPartId}
          explodeValue={state.explodeValue}
          onExplodeChange={setExplodeValue}
          onPartSelect={setSelectedPartId}
        />

        {/* 3D Viewport */}
        <main className="flex-1 relative">
          <Scene
            model={model}
            explodeValue={state.explodeValue}
            selectedPartId={state.selectedPartId || hoveredPartId}
            onPartClick={setSelectedPartId}
            onPartHover={setHoveredPartId}
          />

          {/* Search Bar */}
          <SearchBar onSubmit={handleSearchSubmit} disabled={isAiLoading} />

          {/* Part Info Tooltip */}
          {hoveredPartId && !state.selectedPartId && (
            <PartTooltip
              part={model.parts.find((p) => p.id === hoveredPartId)!}
            />
          )}
        </main>

        {/* Right Sidebar */}
        {showRightPanel && (
          <RightSidebar
            model={model}
            selectedPart={selectedPart || null}
            notes={state.notes}
            onNotesChange={setNotes}
            aiHistory={state.aiHistory}
            onSendMessage={handleSendMessage}
            onClearHistory={clearChatHistory}
            isAiLoading={isAiLoading}
          />
        )}
      </div>
    </div>
  );
}

function PartTooltip({ part }: { part: { nameKo: string; role: string } }) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 glass-panel px-4 py-2 pointer-events-none">
      <p className="text-sm font-medium text-primary">{part.nameKo}</p>
      <p className="text-xs text-muted-foreground max-w-xs truncate">
        {part.role}
      </p>
    </div>
  );
}
