import type {
  ModelData,
  ModelSliceResponse,
  ModelSummary,
  Quiz,
  QuizAnswerItem,
  QuizResultResponse,
} from '@/types/model';

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

export interface ChatResponse {
  content: string;
}

export async function sendChatMessage(
  modelId: string,
  message: string,
  history: string[]
): Promise<string> {
  const response = await fetch(`/api/models/${modelId}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });

  if (!response.ok) {
    throw new Error(`Chat API error: ${response.status}`);
  }

  const data: ChatResponse = await response.json();
  return data.content;
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
