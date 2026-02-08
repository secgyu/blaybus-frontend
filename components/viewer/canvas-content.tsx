'use client';

import { memo, Suspense, type MutableRefObject } from 'react';
import { Bvh, ContactShadows, Environment } from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';

import type { CameraState, ViewerModel } from '@/types/viewer';
import { FloorGrid } from './floor-grid';
import { type ControlsHandle, ManualControls } from './manual-controls';
import { ModelViewer } from './model-viewer';

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#00d4ff" wireframe />
    </mesh>
  );
}

interface CanvasContentProps {
  model: ViewerModel;
  explodeRef: MutableRefObject<number>; // 🔥 Number 대신 Ref 받음
  selectedPartIds: string[];
  onPartClick: (partId: string) => void;
  onPartHover: (partId: string | null) => void;
  controlsRef: React.RefObject<ControlsHandle | null>;
  initialCameraState: CameraState | null;
  onCameraChange: (state: CameraState) => void;
  onZoomChange: (zoomPercent: number) => void;
}

// 🔥 최적화 핵심: memo로 감싸서 슬라이더 변경 시 리렌더링 방지
export const CanvasContent = memo(function CanvasContent({
  model,
  explodeRef,
  selectedPartIds,
  onPartClick,
  onPartHover,
  controlsRef,
  initialCameraState,
  onCameraChange,
  onZoomChange,
}: CanvasContentProps) {
  return (
    <>
      <Environment
        files="/assets/my_warehouse_256.hdr"
        blur={0.5}
        background={false}
        environmentIntensity={0.6}
      />
      <ambientLight intensity={0.15} />

      <directionalLight
        position={[-5, 8, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]} // 화질 복구
        shadow-bias={-0.0001}
        shadow-normalBias={0.04}
      />
      
      <spotLight position={[5, 0, -5]} intensity={0.6} angle={0.5} penumbra={1} color="#ffffff" />
      <pointLight position={[0, 5, 0]} intensity={0.2} color="#3B82F6" />

      {/* 🔥 최적화: 마우스 충돌 연산 가속 (렉 제거 1등 공신) */}
      <Bvh firstHitOnly>
        <Suspense fallback={<LoadingFallback />}>
          <ModelViewer
            model={model}
            explodeRef={explodeRef} // 🔥 Ref 전달
            selectedPartIds={selectedPartIds}
            onPartClick={onPartClick}
            onPartHover={onPartHover}
          />
        </Suspense>
      </Bvh>

      <Suspense fallback={null}>
        <EffectComposer  multisampling={4}>
          <Bloom luminanceThreshold={0.5} mipmapBlur intensity={0.5} radius={0.5} />
        </EffectComposer>
      </Suspense>

      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.6}
        scale={10}
        blur={2.5}
        far={2}
        resolution={512}
        frames={1} // 🔥 중요: 그림자 한 번만 굽기 (성능 10배 향상)
        color="#000000"
      />

      <FloorGrid />

      <ManualControls
        ref={controlsRef}
        initialCameraState={initialCameraState}
        onCameraChange={onCameraChange}
        onZoomChange={onZoomChange}
      />
    </>
  );
}, (prev, next) => {
  // explodeRef는 객체이므로 내용이 바뀌어도 참조가 같으면 리렌더링 안 함 (의도된 동작)
  // 다른 prop들이 바뀌었을 때만 리렌더링 허용
  return (
    prev.model.id === next.model.id &&
    prev.selectedPartIds === next.selectedPartIds &&
    prev.onPartClick === next.onPartClick &&
    prev.onPartHover === next.onPartHover
  );
});