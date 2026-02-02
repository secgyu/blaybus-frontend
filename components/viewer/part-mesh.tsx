'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import type { ModelPart, Vector3, Quaternion } from '@/lib/types';

interface PartMeshProps {
  part: ModelPart;
  position: Vector3;
  rotation?: [number, number, number];
  quaternion?: Quaternion;
  scale?: Vector3;
  color: string;
  isSelected: boolean;
  onClick: () => void;
  onPointerOver: () => void;
  onPointerOut: () => void;
}

export function PartMesh({
  part,
  position,
  rotation,
  quaternion,
  scale,
  color,
  isSelected,
  onClick,
  onPointerOver,
  onPointerOut,
}: PartMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [isHovered, setIsHovered] = useState(false);
  const { scene } = useGLTF(part.glbPath);

  // Clone the scene to avoid sharing issues
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    return cloned;
  }, [scene]);

  // Apply material color and effects
  useEffect(() => {
    if (clonedScene) {
      clonedScene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const material = child.material as THREE.MeshStandardMaterial;
          if (material) {
            // Clone material to avoid affecting other instances
            child.material = material.clone();
            const newMaterial = child.material as THREE.MeshStandardMaterial;
            newMaterial.color = new THREE.Color(color);
            newMaterial.metalness = 0.6;
            newMaterial.roughness = 0.3;
            
            // Apply emissive effect based on selection/hover
            if (isSelected) {
              newMaterial.emissive = new THREE.Color('#00d4ff');
              newMaterial.emissiveIntensity = 0.5;
            } else if (isHovered) {
              newMaterial.emissive = new THREE.Color('#00d4ff');
              newMaterial.emissiveIntensity = 0.3;
            } else {
              newMaterial.emissive = new THREE.Color('#000000');
              newMaterial.emissiveIntensity = 0;
            }
          }
        }
      });
    }
  }, [clonedScene, color, isSelected, isHovered]);

  // Target quaternion for smooth interpolation
  // JSON uses xyzw format (same as Three.js)
  const targetQuat = useMemo(() => {
    if (quaternion) {
      return new THREE.Quaternion(quaternion[0], quaternion[1], quaternion[2], quaternion[3]);
    }
    return null;
  }, [quaternion]);

  // Animate position, rotation, and scale smoothly
  useFrame((_, delta) => {
    if (groupRef.current) {
      // Position lerp
      groupRef.current.position.x += (position[0] - groupRef.current.position.x) * delta * 5;
      groupRef.current.position.y += (position[1] - groupRef.current.position.y) * delta * 5;
      groupRef.current.position.z += (position[2] - groupRef.current.position.z) * delta * 5;

      // Quaternion slerp (if provided)
      if (targetQuat) {
        groupRef.current.quaternion.slerp(targetQuat, delta * 5);
      } else if (rotation) {
        groupRef.current.rotation.x += (rotation[0] - groupRef.current.rotation.x) * delta * 5;
        groupRef.current.rotation.y += (rotation[1] - groupRef.current.rotation.y) * delta * 5;
        groupRef.current.rotation.z += (rotation[2] - groupRef.current.rotation.z) * delta * 5;
      }

      // Scale lerp (if provided)
      if (scale) {
        groupRef.current.scale.x += (scale[0] - groupRef.current.scale.x) * delta * 5;
        groupRef.current.scale.y += (scale[1] - groupRef.current.scale.y) * delta * 5;
        groupRef.current.scale.z += (scale[2] - groupRef.current.scale.z) * delta * 5;
      }
    }
  });

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsHovered(true);
    onPointerOver();
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsHovered(false);
    onPointerOut();
    document.body.style.cursor = 'auto';
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <group ref={groupRef}>
      <primitive
        object={clonedScene}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      />
    </group>
  );
}
