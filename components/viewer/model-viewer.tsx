'use client';

import { useMemo, useRef } from 'react';

import type * as THREE from 'three';

import type { Model, Quaternion, Vector3 } from '@/lib/types';

import { PartMesh } from './part-mesh';

function getNodeExplodeProgress(
  sliderValue: number,
  start: number,
  duration: number
): number {
  if (duration <= 0) return sliderValue > start ? 1 : 0;
  if (sliderValue <= start) return 0;
  if (sliderValue >= start + duration) return 1;
  return (sliderValue - start) / duration;
}

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

  const instancedParts = useMemo(() => {
    const result: InstancedPart[] = [];
    const sliderValue = explodeValue / 100; // 0~1 범위로 변환

    for (const part of model.parts) {
      if (part.instances && part.instances.length > 0) {
        for (const inst of part.instances) {
          const start = inst.explodeStart ?? 0;
          const duration = inst.explodeDuration ?? 1;
          const progress = getNodeExplodeProgress(sliderValue, start, duration);

          const position: Vector3 = [
            inst.position[0] +
              inst.explodeDir[0] * inst.explodeDistance * progress,
            inst.position[1] +
              inst.explodeDir[1] * inst.explodeDistance * progress,
            inst.position[2] +
              inst.explodeDir[2] * inst.explodeDistance * progress,
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
        const basePos = part.basePosition || [0, 0, 0];
        const explodeOff = part.explodeOffset || [0, 0, 0];
        const position: Vector3 = [
          basePos[0] + explodeOff[0] * sliderValue,
          basePos[1] + explodeOff[1] * sliderValue,
          basePos[2] + explodeOff[2] * sliderValue,
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

  const partColors = useMemo(() => {
    const colors = [
      '#0ea5e9',
      '#06b6d4',
      '#14b8a6',
      '#22c55e',
      '#84cc16',
      '#eab308',
      '#f97316',
      '#ef4444',
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
