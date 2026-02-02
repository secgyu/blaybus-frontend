'use client';

import { Suspense, useCallback, useRef, useState } from 'react';

import { ContactShadows, Environment, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';

import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

import type { Model } from '@/lib/types';

import { ModelViewer } from './model-viewer';

interface SceneProps {
  model: Model;
  explodeValue: number;
  selectedPartId: string | null;
  onPartClick: (partId: string | null) => void;
  onPartHover: (partId: string | null) => void;
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#00d4ff" wireframe />
    </mesh>
  );
}

interface AutoRotateControlsProps {
  rotateDirection: number;
  onRotateDirectionChange: (dir: number) => void;
}

function AutoRotateControls({
  rotateDirection,
  onRotateDirectionChange,
}: AutoRotateControlsProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const lastAzimuthRef = useRef<number>(0);
  const isDraggingRef = useRef(false);

  useFrame(() => {
    if (controlsRef.current && !isDraggingRef.current) {
      // 자동 회전 적용
      controlsRef.current.autoRotate = true;
      controlsRef.current.autoRotateSpeed = rotateDirection * 1.5;
    }
  });

  const handleStart = useCallback(() => {
    isDraggingRef.current = true;
    if (controlsRef.current) {
      lastAzimuthRef.current = controlsRef.current.getAzimuthalAngle();
      controlsRef.current.autoRotate = false;
    }
  }, []);

  const handleEnd = useCallback(() => {
    if (controlsRef.current) {
      const currentAzimuth = controlsRef.current.getAzimuthalAngle();
      const delta = currentAzimuth - lastAzimuthRef.current;

      // 드래그 방향에 따라 회전 방향 결정
      if (Math.abs(delta) > 0.01) {
        onRotateDirectionChange(delta > 0 ? -1 : 1);
      }

      controlsRef.current.autoRotate = true;
    }
    isDraggingRef.current = false;
  }, [onRotateDirectionChange]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      rotateSpeed={0.5}
      zoomSpeed={0.8}
      panSpeed={0.5}
      autoRotate
      autoRotateSpeed={rotateDirection * 1.5}
      mouseButtons={{
        LEFT: undefined,
        MIDDLE: 2,
        RIGHT: 0,
      }}
      onStart={handleStart}
      onEnd={handleEnd}
    />
  );
}

export function Scene({
  model,
  explodeValue,
  selectedPartId,
  onPartClick,
  onPartHover,
}: SceneProps) {
  const [rotateDirection, setRotateDirection] = useState(1); // 1: 오른쪽, -1: 왼쪽

  return (
    <div className="w-full h-full relative">
      {/* Grid background overlay */}
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

      <Canvas
        camera={{ position: [1, 0.5, 1], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: '#070b14' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <directionalLight position={[-5, 5, -5]} intensity={0.3} />
        <pointLight position={[0, 5, 0]} intensity={0.5} color="#00d4ff" />

        {/* Environment */}
        <Environment preset="city" />

        {/* Model */}
        <Suspense fallback={<LoadingFallback />}>
          <ModelViewer
            model={model}
            explodeValue={explodeValue}
            selectedPartId={selectedPartId}
            onPartClick={onPartClick}
            onPartHover={onPartHover}
          />
        </Suspense>

        {/* Shadows */}
        <ContactShadows
          position={[0, -0.1, 0]}
          opacity={0.4}
          scale={2}
          blur={2}
          far={1}
          color="#00d4ff"
        />

        {/* Controls with Auto Rotate */}
        <AutoRotateControls
          rotateDirection={rotateDirection}
          onRotateDirectionChange={setRotateDirection}
        />

        {/* Grid helper */}
        <gridHelper
          args={[2, 20, '#1e3a5f', '#0d1f33']}
          position={[0, -0.1, 0]}
        />
      </Canvas>

      {/* Viewport info overlay */}
      <div className="absolute bottom-4 left-4 text-xs font-mono text-muted-foreground/60">
        <div>RMB: Rotate | MMB: Pan | Scroll: Zoom</div>
      </div>
    </div>
  );
}
