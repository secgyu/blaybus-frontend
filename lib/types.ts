export interface ModelPart {
  id: string;
  name: string;
  nameKo: string;
  role: string;
  material: string;
  basePosition: [number, number, number];
  explodeOffset: [number, number, number];
  glbPath: string;
}

export interface Model {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  parts: ModelPart[];
  systemPrompt: string;
}

export interface ViewerState {
  modelId: string;
  camera: {
    position: [number, number, number];
    rotation: [number, number, number];
    zoom: number;
  };
  explodeValue: number;
  selectedPartId: string | null;
  notes: string;
  aiHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }>;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
