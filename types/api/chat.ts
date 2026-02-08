/** 채팅 히스토리 메시지 */
export interface HistoryMessage {
  role: string;
  content: string;
}

/** Chat 요청 모델 정보 */
export interface ChatModelInfo {
  modelId: string;
  title: string;
}

/** Chat 요청 파트 정보 */
export interface ChatPartInfo {
  partId: string;
}

/** POST /v1/chat/messages 요청 */
export interface MessageRequest {
  message: string;
  documentIds?: string[];
  imageUrls?: string[];
  extraMetadata?: Record<string, unknown>;
  history?: HistoryMessage[];
  model?: ChatModelInfo;
  parts?: ChatPartInfo[];
}

/** 인용 정보 */
export interface Citation {
  tag?: string;
  documentId?: string;
  documentTitle?: string;
  pages?: string;
  chunkId?: string;
  distance?: number;
}

/** POST /v1/chat/messages 응답 */
export interface MessageResponse {
  answer: string;
  citations?: Citation[];
}
