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
  isLeftPanelOpen?: boolean;
  onToggleFullscreen?: () => void;
  onCaptureReady?: (capture: () => string | null) => void;
}

export function Scene({
  model,
  explodeValue,
  selectedPartId,
  onPartClick,
  onPartHover,
  onExplodeChange,
  isFullscreen = false,
  isLeftPanelOpen = true,
  onToggleFullscreen,
  onCaptureReady,
}: SceneProps) {
  const controlsRef = useRef<ControlsHandle>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const [isRotatingLeft, setIsRotatingLeft] = useState(false);
  const [isRotatingRight, setIsRotatingRight] = useState(false);
  const [zoomValue, setZoomValue] = useState(50);
  const [canvasKey, setCanvasKey] = useState(() => Date.now());
  const [contextLost, setContextLost] = useState(false);
  const retryCountRef = useRef(0);

  const handleCreated = useCallback(
    ({ gl }: { gl: WebGLRenderer }) => {
      rendererRef.current = gl;
      onCaptureReady?.(() => {
        if (!rendererRef.current) return null;
        return rendererRef.current.domElement.toDataURL('image/png');
      });

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
        canvas.removeEventListener(
          'webglcontextrestored',
          handleContextRestored
        );
      };
    },
    [onCaptureReady]
  );

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

      {/* 3D Canvas — 전체 화면 렌더링, 패널 뒤에서도 격자/3D가 보이도록 */}
      <div className="absolute inset-0">
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

        {/* 슬라이더 — 실제 보이는 3D 영역 기준 중앙 */}
        <BottomSliders
          explodeValue={explodeValue}
          zoomValue={zoomValue}
          onExplodeChange={onExplodeChange}
          onZoomChange={handleZoomSliderChange}
          isFullscreen={isFullscreen}
          isLeftPanelOpen={isLeftPanelOpen}
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
