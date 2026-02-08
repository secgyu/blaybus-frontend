import type {
  ChatModelInfo,
  ChatPartInfo,
  HistoryMessage,
  MessageResponse,
  ModelData,
  ModelSliceResponse,
  ModelSummary,
  Quiz,
  QuizAnswerItem,
  QuizResultResponse,
} from '@/types/api';

export type { ModelSummary };

export interface SaveNodesRequest {
  nodes: ModelData['nodes'];
}

export interface SaveNodesResponse {
  success: boolean;
  message: string;
}

export interface FetchModelsOptions {
  page?: number;
  size?: number;
  sort?: string[];
}

// ---------------------------------------------------------------------------
// 서버 사이드 전용: 백엔드 API를 직접 호출 (서버 컴포넌트에서 사용)
// ---------------------------------------------------------------------------
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export async function fetchModelsServer(
  options: FetchModelsOptions = {}
): Promise<ModelSummary[]> {
  const params = new URLSearchParams();

  if (options.page !== undefined) {
    params.append('page', options.page.toString());
  }
  if (options.size !== undefined) {
    params.append('size', options.size.toString());
  }
  if (options.sort) {
    options.sort.forEach((s) => params.append('sort', s));
  }

  const queryString = params.toString();
  const url = `${API_BASE_URL}/api/models${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, { next: { revalidate: 60 } });

  if (!response.ok) {
    throw new Error(`Failed to fetch models: ${response.status}`);
  }

  const data: ModelSliceResponse = await response.json();
  return data.models;
}

// ---------------------------------------------------------------------------
// 클라이언트 사이드: Next.js API 라우트를 경유 (클라이언트 컴포넌트에서 사용)
// ---------------------------------------------------------------------------
export async function fetchModels(
  options: FetchModelsOptions = {}
): Promise<ModelSummary[]> {
  const data = await fetchModelsPage(options);
  return data.models;
}

export async function fetchModelsPage(
  options: FetchModelsOptions = {}
): Promise<ModelSliceResponse> {
  const params = new URLSearchParams();

  if (options.page !== undefined) {
    params.append('page', options.page.toString());
  }
  if (options.size !== undefined) {
    params.append('size', options.size.toString());
  }
  if (options.sort) {
    options.sort.forEach((s) => params.append('sort', s));
  }

  const queryString = params.toString();
  const url = `/api/models${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch models: ${response.status}`);
  }

  return response.json();
}

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

export interface SendChatMessageOptions {
  modelId: string;
  message: string;
  history?: HistoryMessage[];
  model?: ChatModelInfo;
  parts?: ChatPartInfo[];
  documentIds?: string[];
  imageUrls?: string[];
}

export async function sendChatMessage(
  options: SendChatMessageOptions
): Promise<MessageResponse> {
  const { modelId, message, history, model, parts, documentIds, imageUrls } =
    options;

  const response = await fetch(`${API_BASE_URL}/v1/chat/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      history,
      model,
      parts,
      documentIds,
      imageUrls,
      extraMetadata: { modelId },
    }),
  });

  if (!response.ok) {
    throw new Error(`Chat API error: ${response.status}`);
  }

  const data: MessageResponse = await response.json();
  return data;
}

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

export interface FetchQuizOptions {
  count?: number;
  excludedIds?: number[];
}

export async function fetchQuiz(
  modelId: string,
  options: FetchQuizOptions = {}
): Promise<Quiz[]> {
  const params = new URLSearchParams();

  if (options.count) {
    params.append('count', options.count.toString());
  }

  if (options.excludedIds && options.excludedIds.length > 0) {
    options.excludedIds.forEach((id) =>
      params.append('excludedIds', id.toString())
    );
  }

  const queryString = params.toString();
  const url = `/api/models/${modelId}/quiz${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch quiz: ${response.status}`);
  }

  return response.json();
}

export async function submitQuizAnswers(
  modelId: string,
  answers: QuizAnswerItem[]
): Promise<QuizResultResponse> {
  const response = await fetch(`/api/models/${modelId}/quiz/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  });

  if (!response.ok) {
    throw new Error(`Failed to submit quiz: ${response.status}`);
  }

  return response.json();
}
