/** 3D 좌표 (x, y, z) */
export type Vector3 = [number, number, number];

/** 쿼터니언 회전 (x, y, z, w) */
export type Quaternion = [number, number, number, number];

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
