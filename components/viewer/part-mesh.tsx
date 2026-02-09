'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';

import {
  Color,
  EdgesGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  Quaternion as ThreeQuaternion,
} from 'three';
import type { Group, Material, MeshStandardMaterial } from 'three';

import { MATERIAL_PRESET } from '@/lib/constants/material-preset';
import type { MaterialType } from '@/types/api';
import type { ModelPart, Quaternion, Vector3 } from '@/types/viewer';

const CLICK_THRESHOLD_PX = 5;

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
  const groupRef = useRef<Group>(null);
  const [isHovered, setIsHovered] = useState(false);
  const { scene } = useGLTF(part.glbPath);

  const originalMaterials = useRef<Map<string, Material>>(new Map());
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  const materialConfig = useMemo(() => {
    if (materialType && MATERIAL_PRESET[materialType]) {
      return MATERIAL_PRESET[materialType];
    }
    return { color, metalness: 0.6, roughness: 0.3, vertexColors: false };
  }, [materialType, color]);

  useEffect(() => {
    if (clonedScene) {
      clonedScene.traverse((child) => {
        if (child instanceof Mesh) {
          const mesh = child;

          if (!originalMaterials.current.has(mesh.uuid)) {
            const mat = Array.isArray(mesh.material)
              ? mesh.material[0]
              : mesh.material;
            originalMaterials.current.set(mesh.uuid, mat.clone());
          }

          if (isSelected) {
            const original = originalMaterials.current.get(
              mesh.uuid
            ) as MeshStandardMaterial;
            const newMaterial = original.clone();

            const baseColor = materialType ? materialConfig.color : color;
            newMaterial.color = new Color(baseColor);
            newMaterial.metalness = materialConfig.metalness;
            newMaterial.roughness = materialConfig.roughness;
            newMaterial.emissive.set('#3B82F6');
            newMaterial.emissiveIntensity = 1.2;
            newMaterial.toneMapped = true;

            mesh.material = newMaterial;
          } else {
            const original = originalMaterials.current.get(
              mesh.uuid
            ) as MeshStandardMaterial;
            const restoreMaterial = original.clone();
            const baseColor = materialType ? materialConfig.color : color;
            restoreMaterial.color = new Color(baseColor);
            restoreMaterial.metalness = materialConfig.metalness;
            restoreMaterial.roughness = materialConfig.roughness;

            if (materialConfig.vertexColors !== undefined) {
              restoreMaterial.vertexColors = materialConfig.vertexColors;
            }

            if (isHovered) {
              restoreMaterial.emissive.set('#2563EB');
              restoreMaterial.emissiveIntensity = 0.5;
              restoreMaterial.toneMapped = true;
            } else {
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
            const edgesGeometry = new EdgesGeometry(mesh.geometry, 80);
            const edgesMaterial = new LineBasicMaterial({
              color: 0xffffff,
              linewidth: 1,
              transparent: true,
              opacity: 0.3,
            });
            const edges = new LineSegments(edgesGeometry, edgesMaterial);
            edges.userData.isEdgeLine = true;
            mesh.add(edges);
          }
        }
      });
    }
  }, [clonedScene, color, materialType, materialConfig, isSelected, isHovered]);

  const targetQuat = useMemo(() => {
    if (quaternion) {
      return new ThreeQuaternion(
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

  const onClickRef = useRef(onClick);
  onClickRef.current = onClick;

  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const startX = e.nativeEvent.clientX;
    const startY = e.nativeEvent.clientY;

    const handleUp = (upEvent: PointerEvent) => {
      const dx = upEvent.clientX - startX;
      const dy = upEvent.clientY - startY;
      if (Math.sqrt(dx * dx + dy * dy) < CLICK_THRESHOLD_PX) {
        onClickRef.current();
      }
    };

    window.addEventListener('pointerup', handleUp, { once: true });
  }, []);

  return (
    <group ref={groupRef}>
      <primitive
        object={clonedScene}
        onPointerDown={handlePointerDown}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      />
    </group>
  );
}
