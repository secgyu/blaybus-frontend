'use client';

import { Suspense, useEffect, useMemo, useRef } from 'react';

import { Center, useGLTF } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';

import { Box3, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import type { Group, PerspectiveCamera } from 'three';

import type { ModelPart } from '@/types/viewer';

interface ThumbnailModelProps {
  glbPath: string;
  isSelected: boolean;
}

function ThumbnailModel({ glbPath, isSelected }: ThumbnailModelProps) {
  const { scene } = useGLTF(glbPath);
  const groupRef = useRef<Group>(null);
  const materialsRef = useRef<Map<Mesh, MeshStandardMaterial>>(
    new Map()
  );
  const { camera } = useThree();

  const clonedScene = useMemo(() => {
    const cloned = scene.clone();

    cloned.traverse((child) => {
      if (child instanceof Mesh) {
        const originalMaterial = child.material as MeshStandardMaterial;
        if (originalMaterial) {
          const newMaterial = new MeshStandardMaterial({
            metalness: 0.6,
            roughness: 0.4,
          });
          child.material = newMaterial;
          materialsRef.current.set(child, newMaterial);
        }
      }
    });

    return cloned;
  }, [scene]);

  useEffect(() => {
    if (clonedScene && camera) {
      const box = new Box3().setFromObject(clonedScene);
      const size = box.getSize(new Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = (camera as PerspectiveCamera).fov * (Math.PI / 180);
      const cameraZ = Math.abs(maxDim / Math.sin(fov / 2)) * 0.6;

      camera.position.set(cameraZ * 0.7, cameraZ * 0.5, cameraZ * 0.7);
      camera.lookAt(0, 0, 0);
    }
  }, [clonedScene, camera]);

  useEffect(() => {
    materialsRef.current.forEach((material) => {
      material.color.set(isSelected ? '#00d4ff' : '#8892b0');
      material.emissive.set(isSelected ? '#00d4ff' : '#000000');
      material.emissiveIntensity = isSelected ? 0.3 : 0;
      material.needsUpdate = true;
    });
  }, [isSelected]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      <Center>
        <primitive object={clonedScene} />
      </Center>
    </group>
  );
}

function FallbackBox({ isSelected }: { isSelected: boolean }) {
  const meshRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[0.8, 0.8, 0.8]} />
      <meshStandardMaterial
        color={isSelected ? '#00d4ff' : '#8892b0'}
        metalness={0.6}
        roughness={0.4}
      />
    </mesh>
  );
}

interface PartThumbnailProps {
  part: ModelPart;
  isSelected: boolean;
  onClick: () => void;
}

export function PartThumbnail({
  part,
  isSelected,
  onClick,
}: PartThumbnailProps) {
  return (
    <div onClick={onClick} className="w-full h-full cursor-pointer">
      <Canvas
        camera={{ fov: 50, near: 0.001, far: 1000 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-5, -5, -5]} intensity={0.3} />

        <Suspense fallback={<FallbackBox isSelected={isSelected} />}>
          <ThumbnailModel glbPath={part.glbPath} isSelected={isSelected} />
        </Suspense>
      </Canvas>
    </div>
  );
}
