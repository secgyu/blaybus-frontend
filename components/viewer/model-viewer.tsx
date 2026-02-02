'use client';

import { useMemo, useRef } from 'react';

import { useFrame } from '@react-three/fiber';

import type * as THREE from 'three';

import type { Model, PartInstance, Quaternion, Vector3 } from '@/lib/types';

import { PartMesh } from './part-mesh';

interface InstancedPart {
  key: string;
  partId: string;
  glbPath: string;
  position: Vector3;
  rotation?: Quaternion;
  scale?: Vector3;
}

interface ModelViewerProps {
  model: Model;
  explodeValue: number;
  selectedPartId: string | null;
  onPartClick: (partId: string | null) => void;
  onPartHover: (partId: string | null) => void;
}

export function ModelViewer({
  model,
  explodeValue,
  selectedPartId,
  onPartClick,
  onPartHover,
}: ModelViewerProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Slowly rotate the entire model group
  useFrame((_, delta) => {
    if (groupRef.current && explodeValue === 0) {
      groupRef.current.rotation.y += delta * 0.1;
    }
  });

  // Build instanced parts with calculated positions
  const instancedParts = useMemo(() => {
    const result: InstancedPart[] = [];
    const explodeFactor = explodeValue / 100;

    for (const part of model.parts) {
      // instances가 있으면 각 인스턴스별로 처리
      if (part.instances && part.instances.length > 0) {
        for (const inst of part.instances) {
          const position: Vector3 = [
            inst.position[0] +
              inst.explodeDir[0] * inst.explodeDistance * explodeFactor,
            inst.position[1] +
              inst.explodeDir[1] * inst.explodeDistance * explodeFactor,
            inst.position[2] +
              inst.explodeDir[2] * inst.explodeDistance * explodeFactor,
          ];
          result.push({
            key: inst.nodeId,
            partId: part.id,
            glbPath: part.glbPath,
            position,
            rotation: inst.rotation,
            scale: inst.scale,
          });
        }
      } else {
        // 기존 방식 (basePosition, explodeOffset)
        const basePos = part.basePosition || [0, 0, 0];
        const explodeOff = part.explodeOffset || [0, 0, 0];
        const position: Vector3 = [
          basePos[0] + explodeOff[0] * explodeFactor,
          basePos[1] + explodeOff[1] * explodeFactor,
          basePos[2] + explodeOff[2] * explodeFactor,
        ];
        result.push({
          key: part.id,
          partId: part.id,
          glbPath: part.glbPath,
          position,
        });
      }
    }
    return result;
  }, [model.parts, explodeValue]);

  // Generate unique colors for parts
  const partColors = useMemo(() => {
    const colors = [
      '#0ea5e9', // Sky blue
      '#06b6d4', // Cyan
      '#14b8a6', // Teal
      '#22c55e', // Green
      '#84cc16', // Lime
      '#eab308', // Yellow
      '#f97316', // Orange
      '#ef4444', // Red
    ];

    return model.parts.reduce(
      (acc, part, index) => {
        acc[part.id] = colors[index % colors.length];
        return acc;
      },
      {} as Record<string, string>
    );
  }, [model.parts]);

  return (
    <group ref={groupRef}>
      {instancedParts.map((inst) => {
        const part = model.parts.find((p) => p.id === inst.partId)!;

        return (
          <PartMesh
            key={inst.key}
            part={part}
            position={inst.position}
            rotation={part.baseRotation}
            quaternion={inst.rotation}
            scale={inst.scale}
            color={partColors[inst.partId]}
            isSelected={selectedPartId === inst.partId}
            onClick={() => onPartClick(inst.partId)}
            onPointerOver={() => onPartHover(inst.partId)}
            onPointerOut={() => onPartHover(null)}
          />
        );
      })}
    </group>
  );
}
