'use client';

import {
  Suspense,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import { ContactShadows, Environment, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';

import * as THREE from 'three';

import { RotateCcw, RotateCw } from 'lucide-react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

import { Button } from '@/components/ui/button';
import type { CameraState, Model } from '@/lib/types';
import { useViewerStore } from '@/store/viewer-store';

import { ModelViewer } from './model-viewer';

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

const ManualControls = forwardRef<ControlsHandle, ManualControlsProps>(
  function ManualControls(
    { initialCameraState, onCameraChange, onZoomChange },
    ref
  ) {
    const controlsRef = useRef<OrbitControlsImpl>(null);
    const { camera } = useThree();
    const isRotatingRef = useRef(false);
    const rotateDirectionRef = useRef(0);
    const isInitializedRef = useRef(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const getCurrentDistance = useCallback(() => {
      if (controlsRef.current) {
        return camera.position.distanceTo(controlsRef.current.target);
      }
      return 1.5;
    }, [camera]);

    useEffect(() => {
      if (
        initialCameraState &&
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
          LEFT: 0,
          MIDDLE: 2,
          RIGHT: 0,
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
        environmentIntensity={1.5}
      />
      <ambientLight intensity={0.4} />

      <directionalLight
        position={[-5, 8, 5]}
        intensity={2.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
        shadow-normalBias={0.04}
      />
      <spotLight
        position={[5, 0, -5]}
        intensity={1.5}
        angle={0.5}
        penumbra={1}
        color="#ffffff"
      />

      <pointLight position={[0, 5, 0]} intensity={0.5} color="#00d4ff" />

      <Suspense fallback={<LoadingFallback />}>
        <ModelViewer
          model={model}
          explodeValue={explodeValue}
          selectedPartId={selectedPartId}
          onPartClick={onPartClick}
          onPartHover={onPartHover}
        />
      </Suspense>

      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.6}
        scale={10}
        blur={2.5}
        far={2}
        color="#000000"
      />

      <ManualControls
        ref={controlsRef}
        initialCameraState={initialCameraState}
        onCameraChange={onCameraChange}
        onZoomChange={onZoomChange}
      />

      <gridHelper
        args={[20, 20, '#1e3a5f', '#0d1f33']}
        position={[0, -0.1, 0]}
      />
    </>
  );
}

interface SceneWithControlsProps extends SceneProps {
  onExplodeChange: (value: number) => void;
}

export function Scene({
  model,
  explodeValue,
  selectedPartId,
  onPartClick,
  onPartHover,
  onExplodeChange,
}: SceneWithControlsProps) {
  const controlsRef = useRef<ControlsHandle>(null);
  const [isRotatingLeft, setIsRotatingLeft] = useState(false);
  const [isRotatingRight, setIsRotatingRight] = useState(false);
  const [zoomValue, setZoomValue] = useState(50);
  const [canvasKey, setCanvasKey] = useState(() => Date.now());
  const [contextLost, setContextLost] = useState(false);
  const retryCountRef = useRef(0);

  // WebGL 컨텍스트 손실 시 Canvas 재생성
  const handleCreated = useCallback(({ gl }: { gl: THREE.WebGLRenderer }) => {
    const canvas = gl.domElement;

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.warn('WebGL context lost');
      setContextLost(true);

      // 자동 복구 시도 (최대 3회)
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

    // 컨텍스트 정상 생성 시 초기화
    setContextLost(false);
    retryCountRef.current = 0;

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, []);

  // zustand store에서 카메라 상태 가져오기
  const store = useViewerStore(model.id);
  const cameraState = store((state) => state.cameraState);
  const setCameraState = store((state) => state.setCameraState);
  const isHydrated = store((state) => state.isHydrated);

  // hydration 완료 후에만 초기 카메라 상태 전달
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

  const handleZoomIn = () => {
    controlsRef.current?.zoomIn();
    setZoomValue((prev) => Math.min(100, prev + 10));
  };

  const handleZoomOut = () => {
    controlsRef.current?.zoomOut();
    setZoomValue((prev) => Math.max(0, prev - 10));
  };

  return (
    <div className="w-full h-full relative flex flex-col">
      <div className="flex-1 relative">
        <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

        {contextLost ? (
          <div className="w-full h-full flex items-center justify-center bg-[#070b14]">
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
              toneMappingExposure: 1.0,
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

      <div className="flex-shrink-0 bg-card/90 backdrop-blur-sm border-t border-border p-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <span className="text-xs font-medium text-foreground whitespace-nowrap">
              분해도
            </span>
            <div className="flex-1 relative max-w-[200px]">
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-primary rounded-full transition-all duration-150"
                  style={{ width: `${explodeValue}%` }}
                />
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={explodeValue}
                onChange={(e) => onExplodeChange(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full shadow-[0_0_8px_rgba(0,212,255,0.6)] pointer-events-none transition-all duration-150"
                style={{ left: `calc(${explodeValue}% - 6px)` }}
              />
            </div>
            <div className="flex text-[10px] text-muted-foreground gap-2">
              <span>조립</span>
              <span className="text-primary font-mono">{explodeValue}%</span>
              <span>분해</span>
            </div>
          </div>

          <div className="w-px h-8 bg-border" />

          <div className="flex items-center gap-3 flex-1">
            <span className="text-xs font-medium text-foreground whitespace-nowrap">
              zoom
            </span>
            <div className="flex-1 relative max-w-[200px]">
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-primary rounded-full transition-all duration-150"
                  style={{ width: `${zoomValue}%` }}
                />
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={zoomValue}
                onChange={(e) => handleZoomSliderChange(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full shadow-[0_0_8px_rgba(0,212,255,0.6)] pointer-events-none transition-all duration-150"
                style={{ left: `calc(${zoomValue}% - 6px)` }}
              />
            </div>
            <div className="flex text-[10px] text-muted-foreground gap-2">
              <span>zoom out</span>
              <span className="text-primary font-mono">{zoomValue}%</span>
              <span>zoom in</span>
            </div>
          </div>

          <div className="w-px h-8 bg-border" />

          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 hover:bg-primary/20 hover:text-primary transition-colors ${
                isRotatingLeft ? 'bg-primary/30 text-primary' : ''
              }`}
              onMouseDown={handleRotateLeftStart}
              onMouseUp={handleRotateLeftEnd}
              onMouseLeave={handleRotateLeftEnd}
              onTouchStart={handleRotateLeftStart}
              onTouchEnd={handleRotateLeftEnd}
              title="왼쪽으로 회전"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 hover:bg-primary/20 hover:text-primary transition-colors ${
                isRotatingRight ? 'bg-primary/30 text-primary' : ''
              }`}
              onMouseDown={handleRotateRightStart}
              onMouseUp={handleRotateRightEnd}
              onMouseLeave={handleRotateRightEnd}
              onTouchStart={handleRotateRightStart}
              onTouchEnd={handleRotateRightEnd}
              title="오른쪽으로 회전"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
