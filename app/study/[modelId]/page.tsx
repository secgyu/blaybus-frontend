'use client';

import { use, useCallback, useEffect, useRef, useState } from 'react';

import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';

import { Loader2 } from 'lucide-react';

import { StudyHeader } from '@/components/study-header';
import { ComingSoonPage } from '@/components/viewer/coming-soon-page';
import { PartTooltip } from '@/components/viewer/part-tooltip';
import { StudyLeftPanel } from '@/components/viewer/study-left-panel';
import { StudyRightPanel } from '@/components/viewer/study-right-panel';
import { fetchViewerData } from '@/lib/api';
import { getSystemPrompt } from '@/lib/constants/system-prompts';
import { toViewerModel } from '@/lib/transform';
import { useViewerStore } from '@/store/viewer-store';
import type { ViewerModel } from '@/types/viewer';

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
      <div className="w-full h-full flex items-center justify-center bg-[#070b14]">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <span className="text-primary">3D 뷰어 로딩 중...</span>
        </div>
      </div>
    ),
  }
);

interface PageProps {
  params: Promise<{ modelId: string }>;
}

export default function StudyPage({ params }: PageProps) {
  const { modelId } = use(params);

  if (COMING_SOON_IDS[modelId]) {
    return (
      <ComingSoonPage
        modelId={modelId}
        categoryTitle={COMING_SOON_IDS[modelId]}
      />
    );
  }

  return <ViewerPage modelId={modelId} />;
}

function ViewerPage({ modelId }: { modelId: string }) {
  const [model, setModel] = useState<ViewerModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    async function loadModel() {
      try {
        const data = await fetchViewerData(modelId);
        const systemPrompt = getSystemPrompt(modelId);
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
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const captureRef = useRef<(() => string | null) | null>(null);

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
    <div className="h-screen relative overflow-hidden bg-[#070b14]">
      <div className="absolute inset-0 z-0">
        {isSceneReady ? (
          <Scene
            model={model}
            explodeValue={explodeValue}
            selectedPartId={selectedPartId}
            onPartClick={setSelectedPartId}
            onPartHover={setHoveredPartId}
            onExplodeChange={setExplodeValue}
            isFullscreen={isFullscreen}
            isLeftPanelOpen={isLeftPanelOpen}
            onToggleFullscreen={toggleFullscreen}
            onCaptureReady={(fn) => {
              captureRef.current = fn;
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <span className="text-primary">3D 뷰어 로딩 중...</span>
            </div>
          </div>
        )}
      </div>

      <div
        className={`absolute top-0 left-0 right-0 z-20 transition-opacity duration-500 ease-in-out ${
          isFullscreen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <StudyHeader />
      </div>

      <div
        className={`absolute top-[76px] left-3 bottom-3 z-10 transition-[opacity,transform] duration-500 ease-in-out ${
          isFullscreen
            ? 'opacity-0 pointer-events-none -translate-x-10'
            : 'opacity-100 translate-x-0'
        }`}
      >
        <StudyLeftPanel
          model={model}
          modelId={modelId}
          notes={notes}
          onNotesChange={setNotes}
          onPanelToggle={setIsLeftPanelOpen}
          onQuizActiveChange={setIsQuizActive}
          captureCanvas={() => captureRef.current?.() ?? null}
          selectedPart={
            selectedPartId
              ? (model.parts.find((p) => p.id === selectedPartId) ?? null)
              : null
          }
        />
      </div>

      <div
        className={`absolute top-[76px] right-3 bottom-3 w-[320px] z-10 transition-[opacity,transform] duration-500 ease-in-out ${
          isFullscreen
            ? 'opacity-0 pointer-events-none translate-x-10'
            : 'opacity-100 translate-x-0'
        }`}
      >
        <StudyRightPanel
          model={model}
          selectedPartId={selectedPartId}
          onPartSelect={setSelectedPartId}
          isQuizActive={isQuizActive}
        />
      </div>

      {hoveredPartId && !selectedPartId && !isFullscreen && (
        <PartTooltip part={model.parts.find((p) => p.id === hoveredPartId)!} />
      )}
    </div>
  );
}
