'use client';

import { useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group, Object3D } from 'three';
import * as THREE from 'three'; 

import type { ViewerModel, Vector3 as TypeVector3 } from '@/types/viewer';
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

type RotationData = [number, number, number] | [number, number, number, number] | undefined;

interface StaticPartData {
  key: string;
  partId: string;
  glbPath: string;
  basePosition: [number, number, number]; 
  // 🔥 수정 2: 원본 데이터 형태(쿼터니언 or 오일러)를 그대로 저장
  rotationData: RotationData; 
  scale?: TypeVector3;
  animData: {
    explodeDir: [number, number, number];
    explodeDistance: number;
    start: number;
    duration: number;
  };
}

interface ModelViewerProps {
  model: ViewerModel;
  explodeRef: MutableRefObject<number>;
  selectedPartIds: string[];
  onPartClick: (partId: string) => void;
  onPartHover: (partId: string | null) => void;
}

export function ModelViewer({
  model,
  explodeRef,
  selectedPartIds,
  onPartClick,
  onPartHover,
}: ModelViewerProps) {
  const groupRef = useRef<Group>(null);
  const itemsRef = useRef<Map<string, Object3D>>(new Map());

  const staticParts = useMemo(() => {
    const result: StaticPartData[] = [];

    for (const part of model.parts) {
      if (part.instances && part.instances.length > 0) {
        for (const inst of part.instances) {
          result.push({
            key: inst.nodeId,
            partId: part.id,
            glbPath: part.glbPath,
            basePosition: inst.position,
            rotationData: inst.rotation, 
            scale: inst.scale,
            animData: {
              explodeDir: inst.explodeDir || [0, 0, 0],
              explodeDistance: inst.explodeDistance || 0,
              start: inst.explodeStart ?? 0,
              duration: inst.explodeDuration ?? 1,
            },
          });
        }
      } else {
        const basePos = part.basePosition || [0, 0, 0];
        const explodeOff = part.explodeOffset || [0, 0, 0];
        
        const offsetVec = new THREE.Vector3(...explodeOff);
        const distance = offsetVec.length();
        const direction = distance > 0 ? offsetVec.normalize().toArray() : [0, 0, 0];

        result.push({
          key: part.id,
          partId: part.id,
          glbPath: part.glbPath,
          basePosition: basePos,
          rotationData: part.baseRotation, 
          animData: {
            explodeDir: direction as [number, number, number],
            explodeDistance: distance,
            start: 0,
            duration: 1,
          },
        });
      }
    }
    return result;
  }, [model.parts]);

  const partColors = useMemo(() => {
    const colors = [
      '#0ea5e9', '#06b6d4', '#14b8a6', '#22c55e', 
      '#84cc16', '#eab308', '#f97316', '#ef4444',
    ];
    return model.parts.reduce((acc, part, index) => {
      acc[part.id] = colors[index % colors.length];
      return acc;
    }, {} as Record<string, string>);
  }, [model.parts]);

  useFrame(() => {
    const currentProgress = explodeRef.current / 100;

    itemsRef.current.forEach((obj) => {
      const data = obj.userData as StaticPartData['animData'] & { basePosition: number[] };
      if (!data) return;

      const progress = getNodeExplodeProgress(currentProgress, data.start, data.duration);

      obj.position.set(
        data.basePosition[0] + data.explodeDir[0] * data.explodeDistance * progress,
        data.basePosition[1] + data.explodeDir[1] * data.explodeDistance * progress,
        data.basePosition[2] + data.explodeDir[2] * data.explodeDistance * progress
      );
    });
  });

  return (
    <group ref={groupRef} name="model-root">
      {staticParts.map((inst) => {
        const part = model.parts.find((p) => p.id === inst.partId)!;
        const isSelected = selectedPartIds.includes(inst.partId);

        // 🔥 수정 5: 회전값의 개수에 따라 적절한 Prop 설정
        // 배열 길이가 4면 Quaternion, 3이면 Euler
        const groupProps: any = {
          key: inst.key,
          position: inst.basePosition,
          userData: { basePosition: inst.basePosition, ...inst.animData }
        };

        if (inst.rotationData) {
          if (inst.rotationData.length === 4) {
             // 쿼터니언 (4개)
             groupProps.quaternion = inst.rotationData;
          } else {
             // 오일러 (3개)
             groupProps.rotation = inst.rotationData;
          }
        }

        return (
          <group
            {...groupProps} // 위에서 만든 props 적용
            ref={(el) => {
              if (el) itemsRef.current.set(inst.key, el);
              else itemsRef.current.delete(inst.key);
            }}
          >
            <PartMesh
              part={part}
              position={[0, 0, 0]} 
              scale={inst.scale}
              color={partColors[inst.partId]}
              materialType={part.materialType}
              isSelected={isSelected}
              onClick={() => onPartClick(inst.partId)}
              onPointerOver={() => onPartHover(inst.partId)}
              onPointerOut={() => onPartHover(null)}
            />
          </group>
        );
      })}
    </group>
  );
}