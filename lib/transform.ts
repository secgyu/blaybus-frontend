import type { Model, ModelPart, PartInstance } from '@/lib/types';
import type { ModelData, Node, Part } from '@/types/model';

/**
 * API에서 받은 ModelData를 기존 컴포넌트에서 사용하는 Model 형식으로 변환
 */
export function toViewerModel(
  data: ModelData,
  systemPrompt: string = ''
): Model {
  // parts를 ModelPart 형식으로 변환
  const partsMap = new Map<string, Part>();
  for (const part of data.parts) {
    partsMap.set(part.partId, part);
  }

  // 각 partId별로 노드들을 그룹화
  const nodesByPartId = new Map<string, Node[]>();
  for (const node of data.nodes) {
    const nodes = nodesByPartId.get(node.partId) || [];
    nodes.push(node);
    nodesByPartId.set(node.partId, nodes);
  }

  // ModelPart 배열 생성
  const parts: ModelPart[] = data.parts.map((part) => {
    const nodes = nodesByPartId.get(part.partId) || [];

    // 노드들을 인스턴스로 변환
    // scale 0.01은 Blender 내보내기 설정이므로 무시하고 1로 사용
    const instances: PartInstance[] = nodes.map((node) => ({
      nodeId: node.nodeId,
      position: node.assembled.pos,
      rotation: node.assembled.quat,
      scale: [1, 1, 1] as [number, number, number], // scale 무시, GLB 자체 크기 사용
      explodeDir: node.explode.dir,
      explodeDistance: node.explode.distance,
      explodeStart: node.explode.start,
      explodeDuration: node.explode.duration,
    }));

    return {
      id: part.partId,
      name: part.partId.replace(/_/g, ' '),
      nameKo: part.displayNameKo,
      role: part.summary,
      material: '기본 재질', // API에서 제공하지 않으므로 기본값
      glbPath: part.glbUrl,
      instances: instances.length > 0 ? instances : undefined,
      // 단일 인스턴스용 기본값
      basePosition: instances[0]?.position,
      explodeOffset: instances[0]
        ? ([
            instances[0].explodeDir[0] * instances[0].explodeDistance,
            instances[0].explodeDir[1] * instances[0].explodeDistance,
            instances[0].explodeDir[2] * instances[0].explodeDistance,
          ] as [number, number, number])
        : [0, 0, 0],
    };
  });

  return {
    id: data.model.modelId,
    name: data.model.modelId
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    nameKo: data.model.title,
    description: data.model.overview,
    parts,
    systemPrompt,
  };
}

/**
 * 기존 Model 형식을 API ModelData 형식으로 변환 (역변환)
 */
export function toApiModelData(model: Model): ModelData {
  const parts: Part[] = model.parts.map((part) => ({
    partId: part.id,
    displayNameKo: part.nameKo,
    glbUrl: part.glbPath,
    summary: part.role,
  }));

  const nodes: Node[] = [];
  for (const part of model.parts) {
    if (part.instances) {
      for (const instance of part.instances) {
        nodes.push({
          nodeId: instance.nodeId,
          partId: part.id,
          parentNodeId: null, // 기존 데이터에는 parent 정보가 없음
          assembled: {
            pos: instance.position,
            quat: instance.rotation || [0, 0, 0, 1],
            scale: instance.scale || [1, 1, 1],
          },
          explode: {
            dir: instance.explodeDir,
            distance: instance.explodeDistance,
          },
        });
      }
    }
  }

  return {
    model: {
      modelId: model.id,
      title: model.nameKo,
      thumbnailUrl: `/thumbs/${model.id}.png`,
      overview: model.description,
      theory: '',
    },
    parts,
    nodes,
  };
}
