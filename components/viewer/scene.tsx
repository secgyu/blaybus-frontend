'use client';

import { useCallback, useRef, useState } from 'react';

import { Canvas, events as createPointerEvents } from '@react-three/fiber';
import type { EventManager } from '@react-three/fiber';

import { ACESFilmicToneMapping } from 'three';
import type { WebGLRenderer } from 'three';

import { useViewerStore } from '@/store/viewer-store';
import type { CameraState, ViewerModel } from '@/types/viewer';

import { CanvasContent } from './canvas-content';
import type { ControlsHandle } from './manual-controls';
import { BottomSliders, RotationControls } from './scene-controls';

// 좌측 패널: left-3(12px) + sidebar(168px) = 180px
// 우측 패널: right-3(12px) + panel(394px) = 406px
const LEFT_PANEL_WIDTH = 180;
const RIGHT_PANEL_WIDTH = 406;

function createZoomSafeEvents(
  store: Parameters<typeof createPointerEvents>[0]
) {
  const base = createPointerEvents(store) as EventManager<HTMLElement>;
  return {
    ...base,
    compute(event: PointerEvent | MouseEvent | WheelEvent, state: any) {
      const rect = state.gl.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      state.pointer.set(x, y);
      state.raycaster.setFromCamera(state.pointer, state.camera);
    },
  };
}

interface SceneProps {
  model: ViewerModel;
  explodeValue: number;
  selectedPartId: string | null;
  onPartClick: (partId: string | null) => void;
  onPartHover: (partId: string | null) => void;
  onExplodeChange: (value: number) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export function Scene({
  model,
  explodeValue,
  selectedPartId,
  onPartClick,
  onPartHover,
  onExplodeChange,
  isFullscreen = false,
  onToggleFullscreen,
}: SceneProps) {
  const controlsRef = useRef<ControlsHandle>(null);
  const [isRotatingLeft, setIsRotatingLeft] = useState(false);
  const [isRotatingRight, setIsRotatingRight] = useState(false);
  const [zoomValue, setZoomValue] = useState(50);
  const [canvasKey, setCanvasKey] = useState(() => Date.now());
  const [contextLost, setContextLost] = useState(false);
  const retryCountRef = useRef(0);

  const handleCreated = useCallback(({ gl }: { gl: WebGLRenderer }) => {
    const canvas = gl.domElement;

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.warn('WebGL context lost');
      setContextLost(true);

      if (retryCountRef.current < 3) {
        retryCountRef.current += 1;
        setTimeout(() => {
          setCanvasKey(Date.now());
          setContextLost(false);
        }, 500);
      }
    };

    const handleContextRestored = () => {
      console.log('WebGL context restored');
      setContextLost(false);
      retryCountRef.current = 0;
    };

    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    setContextLost(false);
    retryCountRef.current = 0;

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, []);

  const store = useViewerStore(model.id);
  const cameraState = store((state) => state.cameraState);
  const setCameraState = store((state) => state.setCameraState);
  const isHydrated = store((state) => state.isHydrated);

  const initialCameraState = isHydrated ? cameraState : null;

  const handleCameraChange = useCallback(
    (state: CameraState) => {
      setCameraState(state);
    },
    [setCameraState]
  );

  const handleZoomChange = useCallback((zoomPercent: number) => {
    setZoomValue(zoomPercent);
  }, []);

  const handleZoomSliderChange = (value: number) => {
    setZoomValue(value);
    controlsRef.current?.setZoomLevel(value);
  };

  const handleRotateLeftStart = () => {
    setIsRotatingLeft(true);
    controlsRef.current?.startRotateLeft();
  };

  const handleRotateLeftEnd = () => {
    setIsRotatingLeft(false);
    controlsRef.current?.stopRotate();
  };

  const handleRotateRightStart = () => {
    setIsRotatingRight(true);
    controlsRef.current?.startRotateRight();
  };

  const handleRotateRightEnd = () => {
    setIsRotatingRight(false);
    controlsRef.current?.stopRotate();
  };

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* 격자 배경 — 항상 전체 뷰포트 */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      {/* 3D Canvas — 비풀스크린 시 패널 사이 영역에 배치하여 자동 중앙 정렬 */}
      <div
        className="absolute top-0 bottom-0"
        style={
          isFullscreen
            ? { left: 0, right: 0 }
            : { left: LEFT_PANEL_WIDTH, right: RIGHT_PANEL_WIDTH }
        }
      >
        {contextLost ? (
          <div className="w-full h-full flex items-center justify-center bg-[#070b14]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-primary">3D 뷰어 복구 중...</span>
            </div>
          </div>
        ) : (
          <Canvas
            key={canvasKey}
            camera={{ position: [1, 0.5, 1], fov: 45 }}
            events={createZoomSafeEvents}
            gl={{
              antialias: true,
              alpha: true,
              toneMapping: ACESFilmicToneMapping,
              toneMappingExposure: 0.7,
              preserveDrawingBuffer: true,
              powerPreference: 'high-performance',
              failIfMajorPerformanceCaveat: false,
            }}
            shadows
            style={{ background: 'transparent' }}
            onCreated={handleCreated}
          >
            <CanvasContent
              model={model}
              explodeValue={explodeValue}
              selectedPartId={selectedPartId}
              onPartClick={onPartClick}
              onPartHover={onPartHover}
              controlsRef={controlsRef}
              initialCameraState={initialCameraState}
              onCameraChange={handleCameraChange}
              onZoomChange={handleZoomChange}
            />
          </Canvas>
        )}

        {/* 슬라이더 — Canvas 영역 기준 중앙 */}
        <BottomSliders
          explodeValue={explodeValue}
          zoomValue={zoomValue}
          onExplodeChange={onExplodeChange}
          onZoomChange={handleZoomSliderChange}
        />
      </div>

      <RotationControls
        isRotatingLeft={isRotatingLeft}
        isRotatingRight={isRotatingRight}
        isFullscreen={isFullscreen}
        onRotateLeftStart={handleRotateLeftStart}
        onRotateLeftEnd={handleRotateLeftEnd}
        onRotateRightStart={handleRotateRightStart}
        onRotateRightEnd={handleRotateRightEnd}
        onToggleFullscreen={onToggleFullscreen}
      />
    </div>
  );
}
