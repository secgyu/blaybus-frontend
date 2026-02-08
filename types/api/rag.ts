import type { Citation } from './chat';

/** POST /v1/rag/search 요청 */
export interface SearchRequest {
  query: string;
  topK?: number;
  documentIds?: string[];
}

/** POST /v1/rag/search 응답 */
export interface SearchResponse {
  contextText: string;
  citations?: Citation[];
}
