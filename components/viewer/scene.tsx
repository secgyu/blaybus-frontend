'use client';

import { useCallback, useRef, useState } from 'react';

import { Canvas } from '@react-three/fiber';

import * as THREE from 'three';

import type { CameraState, Model } from '@/lib/types';
import { useViewerStore } from '@/store/viewer-store';

import { CanvasContent } from './canvas-content';
import type { ControlsHandle } from './manual-controls';
import { BottomSliders, RotationControls } from './scene-controls';

interface SceneProps {
  model: Model;
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

  const handleCreated = useCallback(({ gl }: { gl: THREE.WebGLRenderer }) => {
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
    <div className="w-full h-full relative">
      <div className="absolute inset-0">
        <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

        {contextLost ? (
          <div className="w-full h-full flex items-center justify-center bg-[#070b14] pl-[394px] pr-[406px]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-primary">3D 뷰어 복구 중...</span>
            </div>
          </div>
        ) : (
          <Canvas
            key={canvasKey}
            camera={{ position: [1, 0.5, 1], fov: 45 }}
            gl={{
              antialias: true,
              alpha: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 0.7,
              preserveDrawingBuffer: true,
              powerPreference: 'high-performance',
              failIfMajorPerformanceCaveat: false,
            }}
            shadows
            style={{ background: '#070b14' }}
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
      </div>

      {!isFullscreen && (
        <RotationControls
          isRotatingLeft={isRotatingLeft}
          isRotatingRight={isRotatingRight}
          onRotateLeftStart={handleRotateLeftStart}
          onRotateLeftEnd={handleRotateLeftEnd}
          onRotateRightStart={handleRotateRightStart}
          onRotateRightEnd={handleRotateRightEnd}
          onToggleFullscreen={onToggleFullscreen}
        />
      )}

      {!isFullscreen && (
        <BottomSliders
          explodeValue={explodeValue}
          zoomValue={zoomValue}
          onExplodeChange={onExplodeChange}
          onZoomChange={handleZoomSliderChange}
        />
      )}
    </div>
  );
}
