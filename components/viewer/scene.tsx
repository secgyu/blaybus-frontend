'use client';

import { useCallback, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei'; // 🔥 초기 로딩 렉 제거
import { ACESFilmicToneMapping, type WebGLRenderer } from 'three';

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
  explodeValue: initialExplodeValue, // 초기값
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
  
  // 🔥 최적화 핵심 1: 3D 애니메이션용 Ref (리렌더링 안 일으킴)
  const explodeRef = useRef(initialExplodeValue);
  
  // UI 표시용 State (슬라이더 UI만 업데이트)
  const [uiExplodeValue, setUiExplodeValue] = useState(initialExplodeValue);

  // UI 인터랙션 상태 (true면 3D 마우스 감지 끔)
  const [isInteracting, setIsInteracting] = useState(false);
  const [isRotatingLeft, setIsRotatingLeft] = useState(false);
  const [isRotatingRight, setIsRotatingRight] = useState(false);
  const [zoomValue, setZoomValue] = useState(50);
  const [canvasKey, setCanvasKey] = useState(() => Date.now());
  const [contextLost, setContextLost] = useState(false);
  const retryCountRef = useRef(0);

  // 🔥 최적화 핵심 2: 슬라이더 변경 핸들러 분리
  const handleExplodeChangeWrapper = (value: number) => {
    explodeRef.current = value; // 3D 쪽으로 값 직송 (렌더링 X)
    setUiExplodeValue(value);   // UI 업데이트 (렌더링 O -> 하지만 CanvasContent는 memo로 방어)
    onExplodeChange(value);     // 상위 컴포넌트 알림
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
        canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      };
    },
    [onCaptureReady]
  );

  const store = useViewerStore(model.id);
  const cameraState = store((state) => state.cameraState);
  const setCameraState = store((state) => state.setCameraState);
  const isHydrated = store((state) => state.isHydrated);
  const initialCameraState = isHydrated ? cameraState : null;

  const handleCameraChange = useCallback((state: CameraState) => setCameraState(state), [setCameraState]);
  const handleZoomChange = useCallback((val: number) => setZoomValue(val), []);
  const handleZoomSliderChange = (value: number) => {
    setZoomValue(value);
    controlsRef.current?.setZoomLevel(value);
  };

  const handleRotateLeftStart = () => { setIsInteracting(true); setIsRotatingLeft(true); controlsRef.current?.startRotateLeft(); };
  const handleRotateLeftEnd = () => { setIsInteracting(false); setIsRotatingLeft(false); controlsRef.current?.stopRotate(); };
  const handleRotateRightStart = () => { setIsInteracting(true); setIsRotatingRight(true); controlsRef.current?.startRotateRight(); };
  const handleRotateRightEnd = () => { setIsInteracting(false); setIsRotatingRight(false); controlsRef.current?.stopRotate(); };

  return (
    <div className="w-full h-full relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      <div className="absolute inset-0">
        {contextLost ? (
          <div className="w-full h-full flex items-center justify-center bg-[#070b14]">
            <span className="text-primary">3D 뷰어 복구 중...</span>
          </div>
        ) : (
          <div className="w-full h-full" style={{ pointerEvents: isInteracting ? 'none' : 'auto' }}>
            <Canvas
              key={canvasKey}
              dpr={[1, 2]} // 🔥 화질 선명하게 (Retina 대응)
              performance={{ min: 0.9 }} // 프레임 방어
              camera={{ position: [1, 0.5, 1], fov: 45 }}
              gl={{
                antialias: true,
                alpha: true,
                toneMapping: ACESFilmicToneMapping,
                toneMappingExposure: 0.7,
                preserveDrawingBuffer: true,
                powerPreference: 'high-performance',
              }}
              shadows
              style={{ background: 'transparent' }}
              onCreated={handleCreated}
            >
              <CanvasContent
                model={model}
                explodeRef={explodeRef} // 🔥 값이 아니라 Ref 전달
                selectedPartIds={selectedPartIds}
                onPartClick={onPartClick}
                onPartHover={onPartHover}
                controlsRef={controlsRef}
                initialCameraState={initialCameraState}
                onCameraChange={handleCameraChange}
                onZoomChange={handleZoomChange}
              />
              <Preload all /> {/* 🔥 쉐이더 미리 컴파일 */}
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
            explodeValue={uiExplodeValue} // 🔥 UI용 State 사용
            zoomValue={zoomValue}
            onExplodeChange={handleExplodeChangeWrapper} // 🔥 Wrapper 핸들러 사용
            onZoomChange={handleZoomSliderChange}
            isFullscreen={isFullscreen}
            isLeftPanelOpen={isLeftPanelOpen}
          />
        </div>
      </div>

      <div onPointerDown={() => setIsInteracting(true)} onPointerUp={() => setIsInteracting(false)}>
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