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
        uFadeRadius: { value: 20.0 },
        uOpacity: { value: 0.7 },
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
        varying vec2 vUv;
        varying vec3 vWorldPos;

        void main() {
          vec2 worldXZ = vWorldPos.xz;

          vec2 grid = abs(fract(worldXZ / uGridSize - 0.5) - 0.5) / fwidth(worldXZ / uGridSize);
          float mainLine = min(grid.x, grid.y);
          float mainGrid = 1.0 - min(mainLine, 1.0);

          float subGridSize = uGridSize * 5.0;
          vec2 subGrid = abs(fract(worldXZ / subGridSize - 0.5) - 0.5) / fwidth(worldXZ / subGridSize);
          float subLine = min(subGrid.x, subGrid.y);
          float subGridVal = 1.0 - min(subLine, 1.0);

          vec3 color = mix(uSubColor, uMainColor, mainGrid * 0.6 + subGridVal * 1.0);

          float dist = length(worldXZ);
          float fade = 1.0 - smoothstep(uFadeRadius * 0.3, uFadeRadius, dist);

          float lineAlpha = max(mainGrid * 0.4, subGridVal * 0.8);
          float alpha = lineAlpha * fade * uOpacity;

          gl_FragColor = vec4(color, alpha);
        }
      `,
    });
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
      <planeGeometry args={[50, 50, 1, 1]} />
      <primitive object={shaderMaterial} attach="material" />
    </mesh>
  );
}
