'use client';

import { Suspense } from 'react';

import { ContactShadows, Environment, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

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

export function Scene({
  model,
  explodeValue,
  selectedPartId,
  onPartClick,
  onPartHover,
}: SceneProps) {
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
          position={[0.25, -0.1, 0]}
          opacity={0.4}
          scale={2}
          blur={2}
          far={1}
          color="#00d4ff"
        />

        {/* Controls */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.5}
          zoomSpeed={0.8}
          panSpeed={0.5}
          mouseButtons={{
            LEFT: undefined, // Disable left click for selection
            MIDDLE: 2, // Pan
            RIGHT: 0, // Rotate
          }}
        />

        {/* Grid helper */}
        <gridHelper
          args={[2, 20, '#1e3a5f', '#0d1f33']}
          position={[0.25, -0.1, 0]}
        />
      </Canvas>

      {/* Viewport info overlay */}
      <div className="absolute bottom-4 left-4 text-xs font-mono text-muted-foreground/60">
        <div>RMB: Rotate | MMB: Pan | Scroll: Zoom</div>
      </div>
    </div>
  );
}
