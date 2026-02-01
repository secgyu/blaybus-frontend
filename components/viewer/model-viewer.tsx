'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';
import type { Model } from '@/lib/types';
import { PartMesh } from './part-mesh';

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

  // Calculate positions based on explode value
  const partPositions = useMemo(() => {
    return model.parts.map((part) => {
      const explodeFactor = explodeValue / 100;
      return {
        id: part.id,
        position: [
          part.explodeOffset[0] * explodeFactor,
          part.explodeOffset[1] * explodeFactor,
          part.explodeOffset[2] * explodeFactor,
        ] as [number, number, number],
      };
    });
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
    
    return model.parts.reduce((acc, part, index) => {
      acc[part.id] = colors[index % colors.length];
      return acc;
    }, {} as Record<string, string>);
  }, [model.parts]);

  return (
    <group ref={groupRef}>
      {model.parts.map((part) => {
        const positionData = partPositions.find((p) => p.id === part.id);
        const position = positionData?.position || [0, 0, 0];
        
        return (
          <PartMesh
            key={part.id}
            part={part}
            position={position}
            color={partColors[part.id]}
            isSelected={selectedPartId === part.id}
            onClick={() => onPartClick(part.id)}
            onPointerOver={() => onPartHover(part.id)}
            onPointerOut={() => onPartHover(null)}
          />
        );
      })}
    </group>
  );
}
