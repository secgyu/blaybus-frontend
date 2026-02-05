'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';

import * as THREE from 'three';

import type { ModelPart, Quaternion, Vector3 } from '@/lib/types';
import { MATERIAL_PRESET, type MaterialType } from '@/types/model';

interface PartMeshProps {
  part: ModelPart;
  position: Vector3;
  rotation?: [number, number, number];
  quaternion?: Quaternion;
  scale?: Vector3;
  color: string;
  materialType?: MaterialType;
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
  materialType,
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

  // Get material preset or use defaults
  const materialConfig = useMemo(() => {
    if (materialType && MATERIAL_PRESET[materialType]) {
      return MATERIAL_PRESET[materialType];
    }
    // Default fallback
    return { color, metalness: 0.6, roughness: 0.3, vertexColors: false };
  }, [materialType, color]);

  // Apply material color and effects
  useEffect(() => {
    if (clonedScene) {
      clonedScene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const material = child.material as THREE.MeshStandardMaterial;
          if (material) {
            child.material = material.clone();
            const newMaterial = child.material as THREE.MeshStandardMaterial;

            const baseColor = materialType ? materialConfig.color : color;
            newMaterial.color = new THREE.Color(baseColor);
            newMaterial.metalness = materialConfig.metalness;
            newMaterial.roughness = materialConfig.roughness;

            if (materialConfig.vertexColors !== undefined) {
              newMaterial.vertexColors = materialConfig.vertexColors;
            }

            // 선택/호버 상태에 따른 발광 효과
            if (isSelected) {
              // 전체적으로 밝게 빛나는 효과
              newMaterial.color.set('#55ddff');
              newMaterial.emissive.set('#00ccff');
              newMaterial.emissiveIntensity = 3.0;
              newMaterial.metalness = 0.0;
              newMaterial.roughness = 1.0;
              newMaterial.toneMapped = false;
            } else if (isHovered) {
              // 호버 시 밝게 강조 (전체 밝기가 낮아졌으므로 더 돋보임)
              newMaterial.emissive.set('#00d4ff');
              newMaterial.emissiveIntensity = 1.2;
            } else {
              newMaterial.emissive.set('#000000');
              newMaterial.emissiveIntensity = 0;
            }
          }

          const existingEdges = child.children.find(
            (c) => c.userData.isEdgeLine
          );
          if (!existingEdges && child.geometry) {
            const edgesGeometry = new THREE.EdgesGeometry(child.geometry, 30);
            const edgesMaterial = new THREE.LineBasicMaterial({
              color: 0x000000,
              linewidth: 1,
            });
            const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
            edges.userData.isEdgeLine = true;
            child.add(edges);
          }
        }
      });
    }
  }, [clonedScene, color, materialType, materialConfig, isSelected, isHovered]);

  // Target quaternion for smooth interpolation
  // JSON uses xyzw format (same as Three.js)
  const targetQuat = useMemo(() => {
    if (quaternion) {
      return new THREE.Quaternion(
        quaternion[0],
        quaternion[1],
        quaternion[2],
        quaternion[3]
      );
    }
    return null;
  }, [quaternion]);

  // Animate position, rotation, and scale smoothly
  useFrame((_, delta) => {
    if (groupRef.current) {
      // Position lerp
      groupRef.current.position.x +=
        (position[0] - groupRef.current.position.x) * delta * 5;
      groupRef.current.position.y +=
        (position[1] - groupRef.current.position.y) * delta * 5;
      groupRef.current.position.z +=
        (position[2] - groupRef.current.position.z) * delta * 5;

      // Quaternion slerp (if provided)
      if (targetQuat) {
        groupRef.current.quaternion.slerp(targetQuat, delta * 5);
      } else if (rotation) {
        groupRef.current.rotation.x +=
          (rotation[0] - groupRef.current.rotation.x) * delta * 5;
        groupRef.current.rotation.y +=
          (rotation[1] - groupRef.current.rotation.y) * delta * 5;
        groupRef.current.rotation.z +=
          (rotation[2] - groupRef.current.rotation.z) * delta * 5;
      }

      // Scale lerp (if provided)
      if (scale) {
        groupRef.current.scale.x +=
          (scale[0] - groupRef.current.scale.x) * delta * 5;
        groupRef.current.scale.y +=
          (scale[1] - groupRef.current.scale.y) * delta * 5;
        groupRef.current.scale.z +=
          (scale[2] - groupRef.current.scale.z) * delta * 5;
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
