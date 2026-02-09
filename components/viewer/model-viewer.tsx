'use client';

import { type MutableRefObject, useEffect, useMemo, useRef } from 'react';

import { useFrame } from '@react-three/fiber';

import type { Group, Object3D } from 'three';
import * as THREE from 'three';

import type { Vector3 as TypeVector3, ViewerModel } from '@/types/viewer';

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

function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}

function easeOutBack(x: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

type RotationData =
  | [number, number, number]
  | [number, number, number, number]
  | undefined;

interface StaticPartData {
  key: string;
  partId: string;
  glbPath: string;
  basePosition: [number, number, number];
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
  const currentExplodeRef = useRef(0);
  const initialAlignDone = useRef(false);
  const initialFrameCount = useRef(0);

  useEffect(() => {
    initialAlignDone.current = false;
    initialFrameCount.current = 0;
    if (groupRef.current) {
      groupRef.current.position.y = 0;
    }
  }, [model.id]);

  const alignToGround = () => {
    if (!groupRef.current) return;
    const currentOffset = groupRef.current.position.y;
    groupRef.current.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(groupRef.current);
    const localMinY = box.min.y - currentOffset;
    const neededOffset = localMinY < 0 ? -localMinY : 0;
    groupRef.current.position.y = neededOffset;
  };

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
        const direction =
          distance > 0 ? offsetVec.normalize().toArray() : [0, 0, 0];

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
  const lastAppliedExplodeRef = useRef<number>(-1);
  const isAnimatingRef = useRef(false);
  const frameSkipRef = useRef(0);

  useFrame(() => {
    if (!initialAlignDone.current && groupRef.current) {
      initialFrameCount.current += 1;
      if (initialFrameCount.current >= 5) {
        alignToGround();
        initialAlignDone.current = true;
      }
    }

    frameSkipRef.current = (frameSkipRef.current + 1) % 2;
    if (frameSkipRef.current !== 0) return;

    const targetValue = explodeRef.current;
    const prev = currentExplodeRef.current;
    const next = THREE.MathUtils.lerp(prev, targetValue, 0.2);
    currentExplodeRef.current = next;

    const delta = Math.abs(next - lastAppliedExplodeRef.current);

    if (delta < 0.02) {
      if (Math.abs(targetValue - next) < 0.05) {
        isAnimatingRef.current = false;
        return;
      }
      if (!isAnimatingRef.current) return;
    } else {
      isAnimatingRef.current = true;
    }
    lastAppliedExplodeRef.current = next;

    const smoothProgress = next / 100;

    itemsRef.current.forEach((obj) => {
      const data = obj.userData as StaticPartData['animData'] & {
        basePosition: number[];
      };
      if (!data) return;

      const rawProgress = getNodeExplodeProgress(
        smoothProgress,
        data.start,
        data.duration
      );
      const easedProgress = easeInOutCubic(rawProgress);
      obj.position.set(
        data.basePosition[0] +
          data.explodeDir[0] * data.explodeDistance * easedProgress,
        data.basePosition[1] +
          data.explodeDir[1] * data.explodeDistance * easedProgress,
        data.basePosition[2] +
          data.explodeDir[2] * data.explodeDistance * easedProgress
      );
    });

    alignToGround();
  });

  return (
    <group ref={groupRef} name="model-root">
      {staticParts.map((inst) => {
        const part = model.parts.find((p) => p.id === inst.partId)!;
        const isSelected = selectedPartIds.includes(inst.partId);

        const groupProps: any = {
          position: inst.basePosition,
          userData: { basePosition: inst.basePosition, ...inst.animData },
        };

        if (inst.rotationData) {
          if (inst.rotationData.length === 4) {
            groupProps.quaternion = inst.rotationData;
          } else {
            groupProps.rotation = inst.rotationData;
          }
        }

        return (
          <group
            key={inst.key}
            {...groupProps}
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
