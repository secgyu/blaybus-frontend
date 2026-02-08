'use client';

import { Suspense } from 'react';

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
  explodeValue: number;
  selectedPartIds: string[];
  onPartClick: (partId: string) => void;
  onPartHover: (partId: string | null) => void;
  controlsRef: React.RefObject<ControlsHandle | null>;
  initialCameraState: CameraState | null;
  onCameraChange: (state: CameraState) => void;
  onZoomChange: (zoomPercent: number) => void;
}

export function CanvasContent({
  model,
  explodeValue,
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
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
        shadow-normalBias={0.04}
      />
      <spotLight
        position={[5, 0, -5]}
        intensity={0.6}
        angle={0.5}
        penumbra={1}
        color="#ffffff"
      />

      <pointLight position={[0, 5, 0]} intensity={0.2} color="#3B82F6" />
    <Bvh firstHitOnly>
      <Suspense fallback={<LoadingFallback />}>
        <ModelViewer
          model={model}
          explodeValue={explodeValue}
          selectedPartIds={selectedPartIds}
          onPartClick={onPartClick}
          onPartHover={onPartHover}
        />
      </Suspense>
      </Bvh>

      <Suspense fallback={null}>
        
        <EffectComposer 
          multisampling={4} 
        >
          <Bloom
            luminanceThreshold={0.5}
            mipmapBlur
            intensity={0.5}
            radius={0.5}
          />
        </EffectComposer>
      </Suspense>

      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.6}
        scale={10}
        blur={2.5}
        far={2}
        color="#000000"
        resolution={256}
        frames={1}
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
}
