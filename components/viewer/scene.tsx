'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

import { Preload } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

import { ACESFilmicToneMapping, type WebGLRenderer } from 'three';

import { performanceEvents } from '@/lib/performance-events';
import { throttleTrailing } from '@/lib/throttle';
import { useViewerStore } from '@/store/viewer-store';
import type { CameraState, ViewerModel } from '@/types/viewer';

import { CanvasContent } from './canvas-content';
import type { ControlsHandle } from './manual-controls';
import { BottomSliders, RotationControls } from './scene-controls';

interface SceneProps {
  model: ViewerModel;
  explodeValue: number;
  selectedPartIds: string[];
  onPartClick: (partId: string) => void;
  onPartHover: (partId: string | null) => void;
  onExplodeChange: (value: number) => void;
  isFullscreen?: boolean;
  isLeftPanelOpen?: boolean;
  onToggleFullscreen?: () => void;
  onCaptureReady?: (capture: () => string | null) => void;
}

export function Scene({
  model,
  explodeValue: initialExplodeValue,
  selectedPartIds,
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

  const explodeRef = useRef(initialExplodeValue);
  const lastUpdateRef = useRef(0);
  const pendingUpdateRef = useRef<NodeJS.Timeout | null>(null);
  const lastHoverRef = useRef<string | null>(null);
  const emitHoverThrottled = useMemo(() => {
    return throttleTrailing((partId: string | null) => {
      onPartHover(partId);
    }, 50);
  }, [onPartHover]);

  const handlePartHover = useCallback(
    (partId: string | null) => {
      if (lastHoverRef.current === partId) return;
      lastHoverRef.current = partId;

      emitHoverThrottled(partId);
    },
    [emitHoverThrottled]
  );

  const [isInteracting, setIsInteracting] = useState(false);
  const [isRotatingLeft, setIsRotatingLeft] = useState(false);
  const [isRotatingRight, setIsRotatingRight] = useState(false);
  const [zoomValue, setZoomValue] = useState(50);
  const [canvasKey, setCanvasKey] = useState(() => Date.now());
  const [contextLost, setContextLost] = useState(false);
  const retryCountRef = useRef(0);

  const handleExplodeChangeWrapper = (value: number) => {
    explodeRef.current = value;
    const now = Date.now();
    if (now - lastUpdateRef.current < 30) {
      if (pendingUpdateRef.current) clearTimeout(pendingUpdateRef.current);

      pendingUpdateRef.current = setTimeout(() => {
        onExplodeChange(value);
        lastUpdateRef.current = Date.now();
      }, 30);

      return;
    }
    onExplodeChange(value);
    lastUpdateRef.current = now;

    if (pendingUpdateRef.current) {
      clearTimeout(pendingUpdateRef.current);
      pendingUpdateRef.current = null;
    }
  };

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
        setContextLost(false);
        retryCountRef.current = 0;
      };
      canvas.addEventListener('webglcontextlost', handleContextLost);
      canvas.addEventListener('webglcontextrestored', handleContextRestored);
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
    (state: CameraState) => setCameraState(state),
    [setCameraState]
  );
  const handleZoomChange = useCallback((val: number) => setZoomValue(val), []);
  const handleZoomSliderChange = (value: number) => {
    setZoomValue(value);
    controlsRef.current?.setZoomLevel(value);
  };

  const handleRotateLeftStart = () => {
    setIsInteracting(true);
    setIsRotatingLeft(true);
    controlsRef.current?.startRotateLeft();
  };
  const handleRotateLeftEnd = () => {
    setIsInteracting(false);
    setIsRotatingLeft(false);
    controlsRef.current?.stopRotate();
  };
  const handleRotateRightStart = () => {
    setIsInteracting(true);
    setIsRotatingRight(true);
    controlsRef.current?.startRotateRight();
  };
  const handleRotateRightEnd = () => {
    setIsInteracting(false);
    setIsRotatingRight(false);
    controlsRef.current?.stopRotate();
  };

  return (
    <div className="w-full h-full relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      <div className="absolute inset-0">
        {contextLost ? (
          <div className="w-full h-full flex items-center justify-center bg-[#070b14]">
            <span className="text-primary">3D 뷰어 복구 중...</span>
          </div>
        ) : (
          <div
            className="w-full h-full"
            style={{ pointerEvents: isInteracting ? 'none' : 'auto' }}
          >
            <Canvas
              key={canvasKey}
              dpr={[1, 2]}
              performance={{ min: 0.5 }}
              events={performanceEvents}
              camera={{ position: [1, 0.5, 1], fov: 45 }}
              gl={{
                antialias: true,
                alpha: true,
                toneMapping: ACESFilmicToneMapping,
                toneMappingExposure: 0.7,
                preserveDrawingBuffer: true,
                powerPreference: 'high-performance',
              }}
              shadows={true}
              style={{ background: 'transparent' }}
              onCreated={handleCreated}
            >
              <CanvasContent
                model={model}
                explodeRef={explodeRef}
                selectedPartIds={selectedPartIds}
                onPartClick={onPartClick}
                onPartHover={onPartHover}
                controlsRef={controlsRef}
                initialCameraState={initialCameraState}
                onCameraChange={handleCameraChange}
                onZoomChange={handleZoomChange}
              />

              <Preload all />
            </Canvas>
          </div>
        )}

        <div
          className="absolute bottom-0 left-0 w-full"
          onPointerDown={() => setIsInteracting(true)}
          onPointerUp={() => setIsInteracting(false)}
          onPointerLeave={() => setIsInteracting(false)}
        >
          <BottomSliders
            explodeValue={initialExplodeValue}
            zoomValue={zoomValue}
            onExplodeChange={handleExplodeChangeWrapper}
            onZoomChange={handleZoomSliderChange}
            isFullscreen={isFullscreen}
            isLeftPanelOpen={isLeftPanelOpen}
            onPointerDown={() => setIsInteracting(true)}
            onPointerUp={() => setIsInteracting(false)}
          />
        </div>
      </div>

      <div
        onPointerDown={() => setIsInteracting(true)}
        onPointerUp={() => setIsInteracting(false)}
      >
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
    </div>
  );
}
