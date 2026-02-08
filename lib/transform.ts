import type { ModelData, Node, Part } from '@/types/api';
import type { ModelPart, PartInstance, ViewerModel } from '@/types/viewer';

function normalizeGlbPath(glbUrl: string, modelId: string): string {
  let path = glbUrl;

  if (path.startsWith('/glb/')) {
    const fileName = path.slice('/glb/'.length);
    const folderName = modelId
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('_');
    path = `/models/${folderName}/${fileName}`;
  }

  path = path.replace(/%20/g, '_').replace(/ /g, '_');

  return path;
}

export function toViewerModel(
  data: ModelData,
  systemPrompt: string = ''
): ViewerModel {
  const partsMap = new Map<string, Part>();
  for (const part of data.parts) {
    partsMap.set(part.partId, part);
  }

  const nodesByPartId = new Map<string, Node[]>();
  for (const node of data.nodes) {
    const nodes = nodesByPartId.get(node.partId) || [];
    nodes.push(node);
    nodesByPartId.set(node.partId, nodes);
  }

  const parts: ModelPart[] = data.parts.map((part) => {
    const nodes = nodesByPartId.get(part.partId) || [];
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
      name: part.partId
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      nameKo: part.displayNameKo,
      role: part.summary,
      material: '기본 재질', // API에서 제공하지 않으므로 기본값
      glbPath: normalizeGlbPath(part.glbUrl, data.model.modelId),
      materialType: part.materialType, // Material Preset 적용
      instances: instances.length > 0 ? instances : undefined,
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
    theory: data.model.theory,
    parts,
    systemPrompt,
  };
}

export function toApiModelData(model: ViewerModel): ModelData {
  const parts: Part[] = model.parts.map((part) => ({
    partId: part.id,
    displayNameKo: part.nameKo,
    glbUrl: part.glbPath,
    summary: part.role,
    materialType: part.materialType,
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
      theory: model.theory,
    },
    parts,
    nodes,
  };
}
