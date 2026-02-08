import type { Vector3, Quaternion } from '@/types/api/geometry';
import type { MaterialType } from '@/types/api/model';

export type { Vector3, Quaternion };

/** 부품 인스턴스 (노드) - 같은 부품이 여러 위치에 배치될 수 있음 */
export interface PartInstance {
  nodeId: string;
  position: Vector3;
  rotation?: Quaternion;
  scale?: Vector3;
  explodeDir: Vector3;
  explodeDistance: number;
  explodeStart?: number;
  explodeDuration?: number;
}

export interface ModelPart {
  id: string;
  name: string;
  nameKo: string;
  role: string;
  material: string;
  glbPath: string;
  materialType?: MaterialType;
  basePosition?: Vector3;
  baseRotation?: [number, number, number];
  explodeOffset?: Vector3;
  instances?: PartInstance[];
  summary?: string;
}

export interface ViewerModel {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  theory: string;
  parts: ModelPart[];
  systemPrompt: string;
}

/** 카메라 상태 */
export interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
  zoom: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
