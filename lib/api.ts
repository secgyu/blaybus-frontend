import type { ModelData } from '@/types/model';

/** 모델 목록 요약 타입 */
export interface ModelSummary {
  modelId: string;
  title: string;
  thumbnailUrl: string;
  overview: string;
}

/** 채팅 메시지 타입 */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/** 노드 저장 요청 타입 */
export interface SaveNodesRequest {
  nodes: ModelData['nodes'];
}

/** 노드 저장 응답 타입 */
export interface SaveNodesResponse {
  success: boolean;
  message: string;
}

/**
 * GET /api/models - 모델 목록 조회
 */
export async function fetchModels(): Promise<ModelSummary[]> {
  const response = await fetch('/api/models');

  if (!response.ok) {
    throw new Error(`Failed to fetch models: ${response.status}`);
  }

  return response.json();
}

/**
 * GET /api/models/:id/viewer - 모델 상세 데이터 조회
 */
export async function fetchViewerData(modelId: string): Promise<ModelData> {
  const response = await fetch(`/api/models/${modelId}/viewer`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Model not found: ${modelId}`);
    }
    throw new Error(`Failed to fetch viewer data: ${response.status}`);
  }

  return response.json();
}

/**
 * POST /api/models/:id/chat - AI 채팅 (스트리밍)
 * 스트리밍 응답을 처리하여 전체 텍스트를 반환
 */
export async function sendChatMessage(
  modelId: string,
  messages: ChatMessage[],
  partId?: string
): Promise<string> {
  const response = await fetch(`/api/models/${modelId}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, partId }),
  });

  if (!response.ok) {
    throw new Error(`Chat API error: ${response.status}`);
  }

  // Read streaming response
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let fullContent = '';

  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      // Parse SSE chunks
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data:')) {
          const data = line.slice(5).trim();
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'text-delta' && parsed.delta) {
              fullContent += parsed.delta;
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
  }

  return fullContent;
}

/**
 * PUT /admin/models/:id/nodes - 배치(노드) 저장
 */
export async function saveNodes(
  modelId: string,
  nodes: ModelData['nodes']
): Promise<SaveNodesResponse> {
  const response = await fetch(`/admin/models/${modelId}/nodes`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nodes }),
  });

  if (!response.ok) {
    throw new Error(`Failed to save nodes: ${response.status}`);
  }

  return response.json();
}
