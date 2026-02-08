/** 문서 상태 */
export type DocumentStatus = 'UPLOADED' | 'INGESTING' | 'READY' | 'FAILED';

/** 문서 응답 */
export interface DocumentResponse {
  id: string;
  title: string;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
}

/** 문서 수집 작업 응답 */
export interface IngestJobResponse {
  id: string;
  documentId: string;
  status: string;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  chunkCount?: number;
  embeddingModel?: string;
  errorMessage?: string;
}
