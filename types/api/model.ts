import type { Quaternion, Vector3 } from './geometry';

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
  | 'PLASTIC_SATIN_1'
  | 'PLASTIC_SATIN_2'
  | 'PLASTIC_GLOSS';

/** 모델 요약 정보 (목록 조회용) */
export interface ModelSummary {
  modelId: string;
  overview: string;
}

/** 모델 목록 페이징 응답 */
export interface ModelSliceResponse {
  models: ModelSummary[];
  hasNext: boolean;
  pageNumber: number;
}

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
