'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useGLTF } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';

import {
  Color,
  EdgesGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
} from 'three';
import type { Group, Material, MeshStandardMaterial } from 'three';

import { MATERIAL_PRESET } from '@/lib/constants/material-preset';
import type { MaterialType } from '@/types/api';
import type { ModelPart, Vector3 } from '@/types/viewer';

const CLICK_THRESHOLD_PX = 5;

interface PartMeshProps {
  part: ModelPart;
  position: Vector3;
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
  const appliedMaterials = useRef<Material[]>([]);
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  const materialConfig = useMemo(() => {
    if (materialType && MATERIAL_PRESET[materialType]) {
      return MATERIAL_PRESET[materialType];
    }
    return { color, metalness: 0.6, roughness: 0.3, vertexColors: false };
  }, [materialType, color]);

  useEffect(() => {
    appliedMaterials.current.forEach((mat) => mat.dispose());
    appliedMaterials.current = [];

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

          const original = originalMaterials.current.get(
            mesh.uuid
          ) as MeshStandardMaterial;
          const newMaterial = original.clone();
          const baseColor = materialType ? materialConfig.color : color;
          newMaterial.color = new Color(baseColor);
          newMaterial.metalness = materialConfig.metalness;
          newMaterial.roughness = materialConfig.roughness;

          if (isSelected) {
            newMaterial.emissive.set('#3B82F6');
            newMaterial.emissiveIntensity = 1.2;
          } else if (isHovered) {
            newMaterial.emissive.set('#2563EB');
            newMaterial.emissiveIntensity = 0.5;
          } else {
            newMaterial.emissive.set('#000000');
            newMaterial.emissiveIntensity = 0;
            if (materialConfig.vertexColors !== undefined) {
              newMaterial.vertexColors = materialConfig.vertexColors;
            }
          }

          newMaterial.toneMapped = true;
          mesh.material = newMaterial;
          appliedMaterials.current.push(newMaterial);

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

  useEffect(() => {
    return () => {
      appliedMaterials.current.forEach((mat) => mat.dispose());
    };
  }, []);

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
    <group ref={groupRef} position={position} scale={scale || undefined}>
      <primitive
        object={clonedScene}
        onPointerDown={handlePointerDown}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      />
    </group>
  );
}
