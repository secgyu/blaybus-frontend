/** 3D 좌표 (x, y, z) */
export type Vector3 = [number, number, number];

/** 쿼터니언 회전 (x, y, z, w) */
export type Quaternion = [number, number, number, number];

/** Material 타입 정의 */
export type MaterialType =
  | 'METAL_STEEL_POLISHED'
  | 'METAL_STEEL_MACHINED'
  | 'METAL_STEEL_BRUSHED'
  | 'METAL_STEEL_HEAT_TREATED'
  | 'METAL_CAST_ROUGH'
  | 'METAL_ALUMINUM_MACHINED'
  | 'METAL_OILY'
  | 'PLASTIC_MATTE'
  | 'PLASTIC_SATIN'
  | 'PLASTIC_GLOSS';

/** Material Preset 설정 */
export interface MaterialPresetConfig {
  color: string;
  metalness: number;
  roughness: number;
  vertexColors?: boolean;
  disableBaseColorMap?: boolean;
}

/** Material Preset 상수 */
export const MATERIAL_PRESET: Record<MaterialType, MaterialPresetConfig> = {
  // METAL
  METAL_STEEL_POLISHED: {
    color: '#D0D6DB',
    metalness: 1.0,
    roughness: 0.18,
    vertexColors: false,
  },
  METAL_STEEL_MACHINED: {
    color: '#B7BCC2',
    metalness: 1.0,
    roughness: 0.35,
    vertexColors: false,
  },
  METAL_STEEL_BRUSHED: {
    color: '#AEB6BD',
    metalness: 1.0,
    roughness: 0.45,
    vertexColors: false,
  },
  METAL_STEEL_HEAT_TREATED: {
    color: '#8C939A',
    metalness: 1.0,
    roughness: 0.4,
    vertexColors: false,
  },
  METAL_CAST_ROUGH: {
    color: '#6F767D',
    metalness: 1.0,
    roughness: 0.7,
    vertexColors: false,
  },
  METAL_ALUMINUM_MACHINED: {
    color: '#D6DADF',
    metalness: 1.0,
    roughness: 0.48,
    vertexColors: false,
  },
  METAL_OILY: {
    color: '#AAB1B8',
    metalness: 1.0,
    roughness: 0.22,
    vertexColors: false,
  },

  // PLASTIC
  PLASTIC_MATTE: {
    color: '#1B1B1B',
    metalness: 0.0,
    roughness: 0.88,
    vertexColors: false,
  },
  PLASTIC_SATIN: {
    color: '#202020',
    metalness: 0.0,
    roughness: 0.7,
    vertexColors: false,
  },
  PLASTIC_GLOSS: {
    color: '#2A2A2A',
    metalness: 0.0,
    roughness: 0.35,
    vertexColors: false,
  },
};

/** 모델 메타데이터 */
export interface Model {
  modelId: string;
  title: string;
  thumbnailUrl: string;
  overview: string;
  theory: string;
}

/** 부품 정보 */
export interface Part {
  partId: string;
  displayNameKo: string;
  glbUrl: string;
  summary: string;
  materialType?: MaterialType;
}

/** 조립 상태 변환 정보 */
export interface AssembledTransform {
  pos: Vector3;
  quat: Quaternion;
  scale: Vector3;
}

/** 분해 애니메이션 정보 */
export interface ExplodeInfo {
  dir: Vector3;
  distance: number;
  start?: number;
  duration?: number;
}

/** 씬 그래프 노드 */
export interface Node {
  nodeId: string;
  partId: string;
  parentNodeId: string | null;
  assembled: AssembledTransform;
  explode: ExplodeInfo;
}

/** 전체 모델 JSON 스키마 */
export interface ModelData {
  model: Model;
  parts: Part[];
  nodes: Node[];
}
