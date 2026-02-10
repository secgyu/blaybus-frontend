'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import dynamic from 'next/dynamic';

import { Loader2 } from 'lucide-react';

import { StudyHeader } from '@/components/study-header';
import { StudyLeftPanel } from '@/components/viewer/study-left-panel';
import { StudyRightPanel } from '@/components/viewer/study-right-panel';
import { useViewerStore } from '@/store/viewer-store';
import type { ViewerModel } from '@/types/viewer';

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

interface ViewerPageProps {
  model: ViewerModel;
  modelId: string;
}

export function ViewerPage({ model, modelId }: ViewerPageProps) {
  const store = useViewerStore(modelId);
  const selectedPartIds = store((state) => state.selectedPartIds);
  const explodeValue = store((state) => state.explodeValue);
  const notes = store((state) => state.notes);
  const isHydrated = store((state) => state.isHydrated);
  const toggleSelectedPartId = store((state) => state.toggleSelectedPartId);
  const setExplodeValue = store((state) => state.setExplodeValue);
  const setNotes = store((state) => state.setNotes);

  const [isSceneReady, setIsSceneReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const captureRef = useRef<(() => string | null) | null>(null);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  const noop = useCallback(() => {}, []);

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
    if (isHydrated && !isSceneReady) {
      const timeout = setTimeout(() => {
        setIsSceneReady(true);
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [isHydrated, isSceneReady]);

  const showScene = isHydrated && isSceneReady;

  return (
    <div className="h-screen relative overflow-hidden bg-[#070b14]">
      <div className="absolute inset-0 z-0">
        {showScene ? (
          <Scene
            model={model}
            explodeValue={explodeValue}
            selectedPartIds={selectedPartIds}
            onPartClick={toggleSelectedPartId}
            onPartHover={noop}
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
        <StudyHeader modelId={modelId} />
      </div>

      {isHydrated && (
        <>
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
              selectedParts={model.parts.filter((p) =>
                selectedPartIds.includes(p.id)
              )}
            />
          </div>

          <div
            className={`absolute top-[76px] right-3 bottom-3 w-[280px] 2xl:w-[320px] z-10 ${
              isQuizActive
                ? 'hidden'
                : isFullscreen
                  ? 'opacity-0 pointer-events-none translate-x-10 transition-[opacity,transform] duration-500 ease-in-out'
                  : 'opacity-100 translate-x-0 transition-[opacity,transform] duration-500 ease-in-out'
            }`}
          >
            <StudyRightPanel
              model={model}
              selectedPartIds={selectedPartIds}
              onPartSelect={toggleSelectedPartId}
              isQuizActive={isQuizActive}
            />
          </div>
        </>
      )}
    </div>
  );
}
