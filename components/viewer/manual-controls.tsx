'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';

import { OrbitControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';

import * as THREE from 'three';

import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

import {
  DEFAULT_MAX_DISTANCE,
  DEFAULT_MIN_DISTANCE,
  distanceToZoomPercent,
  isUninitializedCameraState,
  zoomPercentToDistance,
} from '@/lib/camera-utils';
import type { CameraState } from '@/types/viewer';

export interface ControlsHandle {
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

export const ManualControls = forwardRef<ControlsHandle, ManualControlsProps>(
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
    const needsAutoFit = useRef(isUninitializedCameraState(initialCameraState));

    const distLimitsRef = useRef({
      min: DEFAULT_MIN_DISTANCE,
      max: DEFAULT_MAX_DISTANCE,
    });

    const getCurrentDistance = useCallback(() => {
      if (controlsRef.current) {
        return camera.position.distanceTo(controlsRef.current.target);
      }
      return 1.5;
    }, [camera]);

    useEffect(() => {
      if (
        initialCameraState &&
        !needsAutoFit.current &&
        !isInitializedRef.current &&
        controlsRef.current
      ) {
        const modelGroup = scene.getObjectByName('model-root');
        if (modelGroup) {
          const box = new THREE.Box3().setFromObject(modelGroup);
          if (!box.isEmpty()) {
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            distLimitsRef.current = {
              min: maxDim * 0.3,
              max: maxDim * 6,
            };
          }
        }

        const { position, target } = initialCameraState;
        camera.position.set(position[0], position[1], position[2]);
        controlsRef.current.target.set(target[0], target[1], target[2]);
        camera.lookAt(target[0], target[1], target[2]);
        controlsRef.current.update();
        isInitializedRef.current = true;

        const distance = camera.position.distanceTo(controlsRef.current.target);
        const { min, max } = distLimitsRef.current;
        onZoomChange(distanceToZoomPercent(distance, min, max));
      }
    }, [initialCameraState, camera, onZoomChange, scene]);

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

        const { min, max } = distLimitsRef.current;
        onZoomChange(distanceToZoomPercent(distance, min, max));
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
          const { min, max } = distLimitsRef.current;
          const targetDistance = zoomPercentToDistance(zoomPercent, min, max);
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
        const { min, max } = distLimitsRef.current;
        return distanceToZoomPercent(getCurrentDistance(), min, max);
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
              const fovRad = (fov * Math.PI) / 180;

              distLimitsRef.current = {
                min: maxDim * 0.3,
                max: maxDim * 6,
              };

              let dist = maxDim / (2 * Math.tan(fovRad / 2));
              dist *= 1.5;
              dist = Math.max(dist, distLimitsRef.current.min);
              dist = Math.min(dist, distLimitsRef.current.max);

              const elevation = Math.PI / 6;
              const azimuth = Math.PI / 4;
              camera.position.set(
                center.x + dist * Math.cos(elevation) * Math.sin(azimuth),
                center.y + dist * Math.sin(elevation),
                center.z + dist * Math.cos(elevation) * Math.cos(azimuth)
              );

              controlsRef.current.target.copy(center);
              camera.lookAt(center);
              controlsRef.current.update();

              isInitializedRef.current = true;
              needsAutoFit.current = false;

              const distance = camera.position.distanceTo(
                controlsRef.current.target
              );
              const { min, max } = distLimitsRef.current;
              onZoomChange(distanceToZoomPercent(distance, min, max));
              debouncedSave();
            }
          }
        }
      }

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
        minDistance={distLimitsRef.current.min}
        maxDistance={distLimitsRef.current.max}
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
