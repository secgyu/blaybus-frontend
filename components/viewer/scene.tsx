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

import { Minus, Plus, RotateCcw, RotateCw } from 'lucide-react';
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
}

interface ManualControlsProps {
  initialCameraState: CameraState | null;
  onCameraChange: (state: CameraState) => void;
}

const ManualControls = forwardRef<ControlsHandle, ManualControlsProps>(
  function ManualControls({ initialCameraState, onCameraChange }, ref) {
    const controlsRef = useRef<OrbitControlsImpl>(null);
    const { camera } = useThree();
    const isRotatingRef = useRef(false);
    const rotateDirectionRef = useRef(0);
    const isInitializedRef = useRef(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 저장된 카메라 상태로 초기화
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
      }
    }, [initialCameraState, camera]);

    // 디바운스된 카메라 상태 저장
    const saveCameraState = useCallback(() => {
      if (controlsRef.current) {
        const position = camera.position;
        const target = controlsRef.current.target;
        onCameraChange({
          position: [position.x, position.y, position.z],
          target: [target.x, target.y, target.z],
          zoom: camera.zoom,
        });
      }
    }, [camera, onCameraChange]);

    const debouncedSave = useCallback(() => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(saveCameraState, 300);
    }, [saveCameraState]);

    // 클린업
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
}: CanvasContentProps) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#00d4ff" />

      <Environment preset="city" />

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
        position={[0, -0.1, 0]}
        opacity={0.4}
        scale={2}
        blur={2}
        far={1}
        color="#00d4ff"
      />

      <ManualControls
        ref={controlsRef}
        initialCameraState={initialCameraState}
        onCameraChange={onCameraChange}
      />

      <gridHelper
        args={[2, 20, '#1e3a5f', '#0d1f33']}
        position={[0, -0.1, 0]}
      />
    </>
  );
}

export function Scene({
  model,
  explodeValue,
  selectedPartId,
  onPartClick,
  onPartHover,
}: SceneProps) {
  const controlsRef = useRef<ControlsHandle>(null);
  const [isRotatingLeft, setIsRotatingLeft] = useState(false);
  const [isRotatingRight, setIsRotatingRight] = useState(false);

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
  };

  const handleZoomOut = () => {
    controlsRef.current?.zoomOut();
  };

  return (
    <div className="w-full h-full relative">
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

      <Canvas
        camera={{ position: [1, 0.5, 1], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: '#070b14' }}
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
        />
      </Canvas>

      <div className="absolute bottom-20 right-4 flex flex-col gap-2 z-10">
        <div className="flex flex-col gap-1 glass-panel p-1 rounded-lg">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 hover:bg-primary/20 hover:text-primary"
            onClick={handleZoomIn}
            title="확대"
          >
            <Plus className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 hover:bg-primary/20 hover:text-primary"
            onClick={handleZoomOut}
            title="축소"
          >
            <Minus className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex gap-1 glass-panel p-1 rounded-lg">
          <Button
            variant="ghost"
            size="icon"
            className={`h-10 w-10 hover:bg-primary/20 hover:text-primary transition-colors ${
              isRotatingLeft ? 'bg-primary/30 text-primary' : ''
            }`}
            onMouseDown={handleRotateLeftStart}
            onMouseUp={handleRotateLeftEnd}
            onMouseLeave={handleRotateLeftEnd}
            onTouchStart={handleRotateLeftStart}
            onTouchEnd={handleRotateLeftEnd}
            title="왼쪽으로 회전"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-10 w-10 hover:bg-primary/20 hover:text-primary transition-colors ${
              isRotatingRight ? 'bg-primary/30 text-primary' : ''
            }`}
            onMouseDown={handleRotateRightStart}
            onMouseUp={handleRotateRightEnd}
            onMouseLeave={handleRotateRightEnd}
            onTouchStart={handleRotateRightStart}
            onTouchEnd={handleRotateRightEnd}
            title="오른쪽으로 회전"
          >
            <RotateCw className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 text-xs font-mono text-muted-foreground/60">
        <div>RMB: Rotate | MMB: Pan | Scroll: Zoom</div>
      </div>
    </div>
  );
}
