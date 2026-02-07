'use client';

import {
  Suspense,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import { ContactShadows, Environment, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';

import * as THREE from 'three';

import { Maximize2, RotateCcw, RotateCw } from 'lucide-react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

import type { CameraState, Model } from '@/lib/types';
import { useViewerStore } from '@/store/viewer-store';

import { ModelViewer } from './model-viewer';

// 셰이더 기반 바닥 그리드 컴포넌트
function FloorGrid() {
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      uniforms: {
        uGridSize: { value: 0.15 },
        uGridThickness: { value: 0.003 },
        uMainColor: { value: new THREE.Color('#0a3d6b') },
        uSubColor: { value: new THREE.Color('#071e35') },
        uFadeRadius: { value: 4.0 },
        uOpacity: { value: 0.7 },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        varying vec3 vWorldPos;
        void main() {
          vUv = uv;
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: /* glsl */ `
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

          // 그리드 라인이 없는 부분은 완전 투명
          float lineAlpha = max(mainGrid * 0.4, subGridVal * 0.8);
          float alpha = lineAlpha * fade * uOpacity;

          gl_FragColor = vec4(color, alpha);
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

interface SceneProps {
  model: Model;
  explodeValue: number;
  selectedPartId: string | null;
  onPartClick: (partId: string | null) => void;
  onPartHover: (partId: string | null) => void;
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#00d4ff" wireframe />
    </mesh>
  );
}

interface ControlsHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  startRotateLeft: () => void;
  startRotateRight: () => void;
  stopRotate: () => void;
  setZoomLevel: (zoomPercent: number) => void;
  getZoomLevel: () => number;
}

interface ManualControlsProps {
  initialCameraState: CameraState | null;
  onCameraChange: (state: CameraState) => void;
  onZoomChange: (zoomPercent: number) => void;
}

const MIN_DISTANCE = 0.3;
const MAX_DISTANCE = 5;

function distanceToZoomPercent(distance: number): number {
  const clamped = Math.max(MIN_DISTANCE, Math.min(MAX_DISTANCE, distance));
  return Math.round(
    ((MAX_DISTANCE - clamped) / (MAX_DISTANCE - MIN_DISTANCE)) * 100
  );
}

function zoomPercentToDistance(percent: number): number {
  return MAX_DISTANCE - (percent / 100) * (MAX_DISTANCE - MIN_DISTANCE);
}

// 사용자가 한 번도 카메라를 조작하지 않은 기본 상태인지 확인
function isUninitializedCameraState(state: CameraState | null): boolean {
  if (!state) return true;
  const { position, target } = state;
  return (
    position[0] === 1 &&
    position[1] === 0.5 &&
    position[2] === 1 &&
    target[0] === 0 &&
    target[1] === 0 &&
    target[2] === 0
  );
}

const ManualControls = forwardRef<ControlsHandle, ManualControlsProps>(
  function ManualControls(
    { initialCameraState, onCameraChange, onZoomChange },
    ref
  ) {
    const controlsRef = useRef<OrbitControlsImpl>(null);
    const { camera, scene, gl } = useThree();
    const isRotatingRef = useRef(false);
    const rotateDirectionRef = useRef(0);
    const isInitializedRef = useRef(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const autoFitFrameCount = useRef(0);
    // auto-fit 대상 여부: null이거나 기본값(한 번도 조작 안 한 상태)이면 auto-fit
    const needsAutoFit = useRef(isUninitializedCameraState(initialCameraState));

    const getCurrentDistance = useCallback(() => {
      if (controlsRef.current) {
        return camera.position.distanceTo(controlsRef.current.target);
      }
      return 1.5;
    }, [camera]);

    // 저장된 카메라 상태 복원 (사용자가 직접 조작했던 경우만)
    useEffect(() => {
      if (
        initialCameraState &&
        !needsAutoFit.current &&
        !isInitializedRef.current &&
        controlsRef.current
      ) {
        const { position, target } = initialCameraState;
        camera.position.set(position[0], position[1], position[2]);
        controlsRef.current.target.set(target[0], target[1], target[2]);
        camera.lookAt(target[0], target[1], target[2]);
        controlsRef.current.update();
        isInitializedRef.current = true;

        const distance = camera.position.distanceTo(controlsRef.current.target);
        onZoomChange(distanceToZoomPercent(distance));
      }
    }, [initialCameraState, camera, onZoomChange]);

    const saveCameraState = useCallback(() => {
      if (controlsRef.current) {
        const position = camera.position;
        const target = controlsRef.current.target;
        const distance = position.distanceTo(target);

        onCameraChange({
          position: [position.x, position.y, position.z],
          target: [target.x, target.y, target.z],
          zoom: camera.zoom,
        });

        onZoomChange(distanceToZoomPercent(distance));
      }
    }, [camera, onCameraChange, onZoomChange]);

    const debouncedSave = useCallback(() => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(saveCameraState, 50);
    }, [saveCameraState]);

    useEffect(() => {
      return () => {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
      };
    }, []);

    useImperativeHandle(ref, () => ({
      zoomIn: () => {
        if (controlsRef.current) {
          const zoomFactor = 0.8;
          camera.position.lerp(controlsRef.current.target, 1 - zoomFactor);
          controlsRef.current.update();
          debouncedSave();
        }
      },
      zoomOut: () => {
        if (controlsRef.current) {
          const direction = camera.position
            .clone()
            .sub(controlsRef.current.target)
            .normalize();
          camera.position.add(direction.multiplyScalar(0.2));
          controlsRef.current.update();
          debouncedSave();
        }
      },
      startRotateLeft: () => {
        isRotatingRef.current = true;
        rotateDirectionRef.current = 1;
      },
      startRotateRight: () => {
        isRotatingRef.current = true;
        rotateDirectionRef.current = -1;
      },
      stopRotate: () => {
        isRotatingRef.current = false;
        rotateDirectionRef.current = 0;
        debouncedSave();
      },
      setZoomLevel: (zoomPercent: number) => {
        if (controlsRef.current) {
          const targetDistance = zoomPercentToDistance(zoomPercent);
          const direction = camera.position
            .clone()
            .sub(controlsRef.current.target)
            .normalize();
          camera.position
            .copy(controlsRef.current.target)
            .add(direction.multiplyScalar(targetDistance));
          controlsRef.current.update();
          debouncedSave();
        }
      },
      getZoomLevel: () => {
        return distanceToZoomPercent(getCurrentDistance());
      },
    }));

    useFrame((_, delta) => {
      if (
        !isInitializedRef.current &&
        needsAutoFit.current &&
        controlsRef.current
      ) {
        autoFitFrameCount.current++;
        if (autoFitFrameCount.current >= 10) {
          const modelGroup = scene.getObjectByName('model-root');
          if (modelGroup) {
            const box = new THREE.Box3().setFromObject(modelGroup);
            if (!box.isEmpty()) {
              const center = box.getCenter(new THREE.Vector3());
              const size = box.getSize(new THREE.Vector3());
              const maxDim = Math.max(size.x, size.y, size.z);
              const fov = (camera as THREE.PerspectiveCamera).fov;

              let dist = maxDim / 2 / Math.tan((fov * Math.PI) / 360);
              dist *= 2.0;
              dist = Math.max(dist, MIN_DISTANCE);
              dist = Math.min(dist, MAX_DISTANCE);

              camera.position.set(
                center.x + dist * 0.6,
                center.y + dist * 0.5,
                center.z + dist * 0.6
              );

              controlsRef.current.target.copy(center);
              camera.lookAt(center);
              camera.updateMatrixWorld();

              const canvasWidth = gl.domElement.clientWidth;
              const canvasHeight = gl.domElement.clientHeight;
              const rightPanelPx = 406;
              const shiftPx = rightPanelPx / 2;
              const fovRad = (fov * Math.PI) / 180;
              const worldHeight = 2 * dist * Math.tan(fovRad / 2);
              const aspect = canvasWidth / canvasHeight;
              const worldWidth = worldHeight * aspect;
              const shiftWorld = (shiftPx / canvasWidth) * worldWidth;

              const rightVec = new THREE.Vector3();
              rightVec.setFromMatrixColumn(camera.matrixWorld, 0);
              const panOffset = rightVec.multiplyScalar(shiftWorld);

              controlsRef.current.target.add(panOffset);
              camera.position.add(panOffset);
              controlsRef.current.update();

              isInitializedRef.current = true;
              needsAutoFit.current = false;

              const distance = camera.position.distanceTo(
                controlsRef.current.target
              );
              onZoomChange(distanceToZoomPercent(distance));
              debouncedSave();
            }
          }
        }
      }

      // 수동 회전 처리
      if (controlsRef.current && isRotatingRef.current) {
        const rotateSpeed = 2;
        const angle = rotateDirectionRef.current * rotateSpeed * delta;

        const target = controlsRef.current.target;
        const offset = camera.position.clone().sub(target);
        const spherical = new THREE.Spherical().setFromVector3(offset);
        spherical.theta += angle;
        offset.setFromSpherical(spherical);
        camera.position.copy(target).add(offset);
        camera.lookAt(target);
        controlsRef.current.update();
      }
    });

    return (
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
        panSpeed={0.5}
        autoRotate={false}
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
        minDistance={MIN_DISTANCE}
        maxDistance={MAX_DISTANCE}
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN,
        }}
        onChange={debouncedSave}
      />
    );
  }
);

interface CanvasContentProps extends SceneProps {
  controlsRef: React.RefObject<ControlsHandle | null>;
  initialCameraState: CameraState | null;
  onCameraChange: (state: CameraState) => void;
  onZoomChange: (zoomPercent: number) => void;
}

function CanvasContent({
  model,
  explodeValue,
  selectedPartId,
  onPartClick,
  onPartHover,
  controlsRef,
  initialCameraState,
  onCameraChange,
  onZoomChange,
}: CanvasContentProps) {
  return (
    <>
      <Environment
        files="/assets/my_warehouse_256.hdr"
        blur={1}
        background={false}
        environmentIntensity={0.6}
      />
      <ambientLight intensity={0.15} />

      <directionalLight
        position={[-5, 8, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
        shadow-normalBias={0.04}
      />
      <spotLight
        position={[5, 0, -5]}
        intensity={0.6}
        angle={0.5}
        penumbra={1}
        color="#ffffff"
      />

      <pointLight position={[0, 5, 0]} intensity={0.2} color="#3B82F6" />

      <Suspense fallback={<LoadingFallback />}>
        <ModelViewer
          model={model}
          explodeValue={explodeValue}
          selectedPartId={selectedPartId}
          onPartClick={onPartClick}
          onPartHover={onPartHover}
        />
      </Suspense>

      <Suspense fallback={null}>
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.5}
            mipmapBlur
            intensity={0.5}
            radius={0.5}
          />
        </EffectComposer>
      </Suspense>

      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.6}
        scale={10}
        blur={2.5}
        far={2}
        color="#000000"
      />

      <FloorGrid />

      <ManualControls
        ref={controlsRef}
        initialCameraState={initialCameraState}
        onCameraChange={onCameraChange}
        onZoomChange={onZoomChange}
      />
    </>
  );
}

interface SceneWithControlsProps extends SceneProps {
  onExplodeChange: (value: number) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export function Scene({
  model,
  explodeValue,
  selectedPartId,
  onPartClick,
  onPartHover,
  onExplodeChange,
  isFullscreen = false,
  onToggleFullscreen,
}: SceneWithControlsProps) {
  const controlsRef = useRef<ControlsHandle>(null);
  const [isRotatingLeft, setIsRotatingLeft] = useState(false);
  const [isRotatingRight, setIsRotatingRight] = useState(false);
  const [zoomValue, setZoomValue] = useState(50);
  const [canvasKey, setCanvasKey] = useState(() => Date.now());
  const [contextLost, setContextLost] = useState(false);
  const retryCountRef = useRef(0);

  const handleCreated = useCallback(({ gl }: { gl: THREE.WebGLRenderer }) => {
    const canvas = gl.domElement;

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.warn('WebGL context lost');
      setContextLost(true);

      if (retryCountRef.current < 3) {
        retryCountRef.current += 1;
        setTimeout(() => {
          setCanvasKey(Date.now());
          setContextLost(false);
        }, 500);
      }
    };

    const handleContextRestored = () => {
      console.log('WebGL context restored');
      setContextLost(false);
      retryCountRef.current = 0;
    };

    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    setContextLost(false);
    retryCountRef.current = 0;

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, []);

  const store = useViewerStore(model.id);
  const cameraState = store((state) => state.cameraState);
  const setCameraState = store((state) => state.setCameraState);
  const isHydrated = store((state) => state.isHydrated);

  const initialCameraState = isHydrated ? cameraState : null;

  const handleCameraChange = useCallback(
    (state: CameraState) => {
      setCameraState(state);
    },
    [setCameraState]
  );

  const handleZoomChange = useCallback((zoomPercent: number) => {
    setZoomValue(zoomPercent);
  }, []);

  const handleZoomSliderChange = (value: number) => {
    setZoomValue(value);
    controlsRef.current?.setZoomLevel(value);
  };

  const handleRotateLeftStart = () => {
    setIsRotatingLeft(true);
    controlsRef.current?.startRotateLeft();
  };

  const handleRotateLeftEnd = () => {
    setIsRotatingLeft(false);
    controlsRef.current?.stopRotate();
  };

  const handleRotateRightStart = () => {
    setIsRotatingRight(true);
    controlsRef.current?.startRotateRight();
  };

  const handleRotateRightEnd = () => {
    setIsRotatingRight(false);
    controlsRef.current?.stopRotate();
  };

  return (
    <div className="w-full h-full relative">
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

        {contextLost ? (
          <div className="w-full h-full flex items-center justify-center bg-[#070b14] pl-[394px] pr-[406px]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-primary">3D 뷰어 복구 중...</span>
            </div>
          </div>
        ) : (
          <Canvas
            key={canvasKey}
            camera={{ position: [1, 0.5, 1], fov: 45 }}
            gl={{
              antialias: true,
              alpha: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 0.7,
              preserveDrawingBuffer: true,
              powerPreference: 'high-performance',
              failIfMajorPerformanceCaveat: false,
            }}
            shadows
            style={{ background: '#070b14' }}
            onCreated={handleCreated}
          >
            <CanvasContent
              model={model}
              explodeValue={explodeValue}
              selectedPartId={selectedPartId}
              onPartClick={onPartClick}
              onPartHover={onPartHover}
              controlsRef={controlsRef}
              initialCameraState={initialCameraState}
              onCameraChange={handleCameraChange}
              onZoomChange={handleZoomChange}
            />
          </Canvas>
        )}
      </div>

      {/* Top-right control buttons - 풀스크린에서는 숨김 */}
      {!isFullscreen && (
        <div className="absolute top-3 right-[418px] flex items-center z-10">
          <button
            className={`w-12 h-12 rounded-xl bg-[#595959] flex items-center justify-center text-[#FAFAFA] hover:bg-[#6b6b6b] transition-colors ${
              isRotatingLeft ? 'bg-[#6b6b6b]' : ''
            }`}
            onMouseDown={handleRotateLeftStart}
            onMouseUp={handleRotateLeftEnd}
            onMouseLeave={handleRotateLeftEnd}
            onTouchStart={handleRotateLeftStart}
            onTouchEnd={handleRotateLeftEnd}
            title="왼쪽으로 회전"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
          <div className="w-5" />
          <button
            className={`w-12 h-12 rounded-xl bg-[#595959] flex items-center justify-center text-[#FAFAFA] hover:bg-[#6b6b6b] transition-colors ${
              isRotatingRight ? 'bg-[#6b6b6b]' : ''
            }`}
            onMouseDown={handleRotateRightStart}
            onMouseUp={handleRotateRightEnd}
            onMouseLeave={handleRotateRightEnd}
            onTouchStart={handleRotateRightStart}
            onTouchEnd={handleRotateRightEnd}
            title="오른쪽으로 회전"
          >
            <RotateCw className="w-6 h-6" />
          </button>
          <div className="w-[76px]" />
          <button
            className="w-12 h-12 rounded-xl bg-[#595959] flex items-center justify-center text-[#FAFAFA] hover:bg-[#6b6b6b] transition-colors"
            onClick={onToggleFullscreen}
            title="전체화면"
          >
            <Maximize2 className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Bottom sliders - 풀스크린에서는 숨김 */}
      {!isFullscreen && (
        <div className="absolute bottom-5 left-[406px] right-[418px] z-10">
          <div className="flex gap-12">
            {/* Explode Slider - 분해도 */}
            <div className="flex-1 flex flex-col items-start">
              <span className="text-[13px] font-bold text-[#FAFAFA]">
                분해도
              </span>
              <span className="text-[11px] text-[#FAFAFA]/80 mt-1">
                {explodeValue}%
              </span>
              <div className="w-full relative h-5 flex items-center mt-1.5">
                <div className="w-full h-[3px] bg-[#FAFAFA]/50 rounded-full" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={explodeValue}
                  onChange={(e) => onExplodeChange(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[#FAFAFA] rounded-full pointer-events-none transition-all duration-150"
                  style={{
                    left: `calc(${explodeValue}% - 8px)`,
                    boxShadow: '2px 2px 20px #172554, -2px -2px 20px #172554',
                  }}
                />
              </div>
            </div>

            {/* Zoom Slider */}
            <div className="flex-1 flex flex-col items-start">
              <span className="text-[13px] font-bold text-[#FAFAFA] uppercase tracking-wider">
                ZOOM
              </span>
              <span className="text-[11px] text-[#FAFAFA]/80 mt-1">IN</span>
              <div className="w-full relative h-5 flex items-center mt-1.5">
                <div className="w-full h-[3px] bg-[#FAFAFA]/50 rounded-full" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={zoomValue}
                  onChange={(e) =>
                    handleZoomSliderChange(Number(e.target.value))
                  }
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[#FAFAFA] rounded-full pointer-events-none transition-all duration-150"
                  style={{
                    left: `calc(${zoomValue}% - 8px)`,
                    boxShadow: '2px 2px 20px #172554, -2px -2px 20px #172554',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
