'use client';

import { useMemo } from 'react';

import { Color, DoubleSide, ShaderMaterial } from 'three';

export function FloorGrid() {
  const shaderMaterial = useMemo(() => {
    return new ShaderMaterial({
      transparent: true,
      side: DoubleSide,
      depthWrite: false,
      uniforms: {
        uGridSize: { value: 0.15 },
        uGridThickness: { value: 0.003 },
        uMainColor: { value: new Color('#0a3d6b') },
        uSubColor: { value: new Color('#071e35') },
        uFadeRadius: { value: 4.0 },
        uOpacity: { value: 0.7 },
        uGlowRadius: { value: 1.5 },
        uGlowIntensity: { value: 0.35 },
        uGlowColor: { value: new Color('#0a5cb3') },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldPos;
        void main() {
          vUv = uv;
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform float uGridSize;
        uniform float uGridThickness;
        uniform vec3 uMainColor;
        uniform vec3 uSubColor;
        uniform float uFadeRadius;
        uniform float uOpacity;
        uniform float uGlowRadius;
        uniform float uGlowIntensity;
        uniform vec3 uGlowColor;
        varying vec2 vUv;
        varying vec3 vWorldPos;

        void main() {
          vec2 worldXZ = vWorldPos.xz;

          // 메인 그리드 라인
          vec2 grid = abs(fract(worldXZ / uGridSize - 0.5) - 0.5) / fwidth(worldXZ / uGridSize);
          float mainLine = min(grid.x, grid.y);
          float mainGrid = 1.0 - min(mainLine, 1.0);

          // 서브 그리드 (5배 큰 간격)
          float subGridSize = uGridSize * 5.0;
          vec2 subGrid = abs(fract(worldXZ / subGridSize - 0.5) - 0.5) / fwidth(worldXZ / subGridSize);
          float subLine = min(subGrid.x, subGrid.y);
          float subGridVal = 1.0 - min(subLine, 1.0);

          // 컬러 혼합 (서브 그리드는 더 밝게)
          vec3 color = mix(uSubColor, uMainColor, mainGrid * 0.6 + subGridVal * 1.0);

          // 중앙에서 바깥으로 원형 페이드
          float dist = length(worldXZ);
          float fade = 1.0 - smoothstep(uFadeRadius * 0.3, uFadeRadius, dist);

          // 바닥 글로우 (중앙 원형 조명 효과)
          float glow = uGlowIntensity * exp(-dist * dist / (uGlowRadius * uGlowRadius));

          // 그리드 라인 알파
          float lineAlpha = max(mainGrid * 0.4, subGridVal * 0.8);
          float gridAlpha = lineAlpha * fade * uOpacity;

          // 글로우와 그리드 합성
          vec3 finalColor = mix(uGlowColor, color, step(0.01, lineAlpha));
          float finalAlpha = max(gridAlpha, glow * fade);
          gl_FragColor = vec4(finalColor, finalAlpha);
        }
      `,
    });
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
      <planeGeometry args={[12, 12, 1, 1]} />
      <primitive object={shaderMaterial} attach="material" />
    </mesh>
  );
}
