import type { CameraState } from '@/lib/types';

export const DEFAULT_MIN_DISTANCE = 0.3;
export const DEFAULT_MAX_DISTANCE = 5;

export function distanceToZoomPercent(
  distance: number,
  minDist: number,
  maxDist: number
): number {
  const clamped = Math.max(minDist, Math.min(maxDist, distance));
  return Math.round(((maxDist - clamped) / (maxDist - minDist)) * 100);
}

export function zoomPercentToDistance(
  percent: number,
  minDist: number,
  maxDist: number
): number {
  return maxDist - (percent / 100) * (maxDist - minDist);
}

export function isUninitializedCameraState(state: CameraState | null): boolean {
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
