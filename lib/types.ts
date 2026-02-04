export type Vector3 = [number, number, number];
export type Quaternion = [number, number, number, number];

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
  materialType?: import('@/types/model').MaterialType;
  basePosition?: Vector3;
  baseRotation?: [number, number, number];
  explodeOffset?: Vector3;
  instances?: PartInstance[];
}

export interface Model {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  parts: ModelPart[];
  systemPrompt: string;
}

/** 카메라 상태 */
export interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
  zoom: number;
}

export interface ViewerState {
  modelId: string;
  camera: CameraState;
  explodeValue: number;
  selectedPartId: string | null;
  notes: string;
  aiHistory: ChatMessage[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
