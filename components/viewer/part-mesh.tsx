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

  // 1. 원본 재질을 백업할 Ref 생성
  const originalMaterials = useRef<Map<string, THREE.Material>>(new Map());

  // 2. Scene 복제 (메모리 최적화)
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  // Material 설정값 가져오기
  const materialConfig = useMemo(() => {
    if (materialType && MATERIAL_PRESET[materialType]) {
      return MATERIAL_PRESET[materialType];
    }
    return { color, metalness: 0.6, roughness: 0.3, vertexColors: false };
  }, [materialType, color]);

  useEffect(() => {
    if (clonedScene) {
      clonedScene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mesh = child;

          if (!originalMaterials.current.has(mesh.uuid)) {
            const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
            originalMaterials.current.set(mesh.uuid, mat.clone());
          }

          if (isSelected) {
     
            const original = originalMaterials.current.get(mesh.uuid) as THREE.MeshStandardMaterial;
            const newMaterial = original.clone();

            const baseColor = materialType ? materialConfig.color : color;
            newMaterial.color = new THREE.Color(baseColor);
            newMaterial.metalness = materialConfig.metalness;
            newMaterial.roughness = materialConfig.roughness;
            newMaterial.emissive.set("#3B82F6");
            newMaterial.emissiveIntensity = 1.2; // Bloom 강도
            newMaterial.toneMapped = true; 

            mesh.material = newMaterial;

          } else {
  
            const original = originalMaterials.current.get(mesh.uuid) as THREE.MeshStandardMaterial;
            const restoreMaterial = original.clone();
            const baseColor = materialType ? materialConfig.color : color;
            restoreMaterial.color = new THREE.Color(baseColor);
            restoreMaterial.metalness = materialConfig.metalness;
            restoreMaterial.roughness = materialConfig.roughness;

            if (materialConfig.vertexColors !== undefined) {
              restoreMaterial.vertexColors = materialConfig.vertexColors;
            }

            if (isHovered) {
              // 호버 효과
              restoreMaterial.emissive.set('#3B82F6');
              restoreMaterial.emissiveIntensity = 0.7;
              restoreMaterial.toneMapped = true;
            } else {
              // 평상시
              restoreMaterial.emissive.set('#000000');
              restoreMaterial.emissiveIntensity = 0;
              restoreMaterial.toneMapped = true;
            }

            mesh.material = restoreMaterial;
          }

          const existingEdges = mesh.children.find(
            (c) => c.userData.isEdgeLine
          );
          if (!existingEdges && mesh.geometry) {
            const edgesGeometry = new THREE.EdgesGeometry(mesh.geometry, 80);
            const edgesMaterial = new THREE.LineBasicMaterial({
              color: 0xffffff,
              linewidth: 1,
              transparent: true,
              opacity: 0.3
            });
            const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
            edges.userData.isEdgeLine = true;
            mesh.add(edges);
          }
        }
      });
    }
  }, [clonedScene, color, materialType, materialConfig, isSelected, isHovered]);

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

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.position.x +=
        (position[0] - groupRef.current.position.x) * delta * 5;
      groupRef.current.position.y +=
        (position[1] - groupRef.current.position.y) * delta * 5;
      groupRef.current.position.z +=
        (position[2] - groupRef.current.position.z) * delta * 5;

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