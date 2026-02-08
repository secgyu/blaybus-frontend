/** PDF용 채팅 메시지 */
export interface PdfChatMessage {
  question: string;
  answer: string;
}

/** PDF용 퀴즈 */
export interface PdfQuizSet {
  quizQuestion: string;
  quizAnswer: string;
}

/** POST /api/models/{id}/pdf 요청 */
export interface PdfRequestDto {
  modelImage?: string;
  memo?: string;
  chatLogs?: PdfChatMessage[];
  quizs?: PdfQuizSet[];
}
