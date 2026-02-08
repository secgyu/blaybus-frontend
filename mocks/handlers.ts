import { HttpResponse, delay, http } from 'msw';

import type {
  MessageRequest,
  ModelData,
  PdfRequestDto,
} from '@/types/api';

import DroneData from './model/Dron.json';
import LeafSpringData from './model/Leaf_Spring.json';
import MachineViceData from './model/Machine_Vice.json';
import RobotArmData from './model/Robot_Arm.json';
import RobotGripperData from './model/Robot_Gripper.json';
import SuspensionData from './model/Suspension.json';
// Import mock data JSON files
import V4EngineData from './model/V4_Engine.json';

// All mock data with normalized model IDs
const mockDataMap: Record<string, ModelData> = {
  v4_engine: V4EngineData as ModelData,
  suspension: SuspensionData as ModelData,
  drone: DroneData as ModelData,
  robot_arm: RobotArmData as ModelData,
  robot_gripper: RobotGripperData as ModelData,
  leaf_spring: LeafSpringData as ModelData,
  machine_vice: MachineViceData as ModelData,
};

// --- Mock 퀴즈 데이터 (모든 모델 공통) ---
const mockQuizzes = [
  {
    questionId: 1,
    type: 'MULTIPLE_CHOICE' as const,
    question: '[Mock] 이 모델의 주요 구성 요소는 무엇인가요?',
    options: [
      { no: 1, content: '보기 1' },
      { no: 2, content: '보기 2' },
      { no: 3, content: '보기 3 (정답)' },
      { no: 4, content: '보기 4' },
    ],
  },
  {
    questionId: 2,
    type: 'MULTIPLE_CHOICE' as const,
    question: '[Mock] 이 부품의 재질로 가장 적합한 것은?',
    options: [
      { no: 1, content: '플라스틱' },
      { no: 2, content: '강철 (정답)' },
      { no: 3, content: '나무' },
      { no: 4, content: '고무' },
    ],
  },
  {
    questionId: 3,
    type: 'SHORT_ANSWER' as const,
    question: '[Mock] 이 모델의 작동 원리를 간단히 설명하세요.',
    options: [],
  },
];

export const handlers = [
  // GET /api/models - 모델 목록 조회
  http.get('/api/models', async ({ request }) => {
    await delay(200);

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0', 10);
    const size = parseInt(url.searchParams.get('size') || '20', 10);

    const allModels = Object.entries(mockDataMap).map(([id, data]) => ({
      modelId: id,
      overview: data.model.overview,
    }));

    const start = page * size;
    const sliced = allModels.slice(start, start + size);

    return HttpResponse.json({
      models: sliced,
      hasNext: start + size < allModels.length,
      pageNumber: page,
    });
  }),

  // GET /api/models/:id/viewer - 모델 상세 (parts, nodes)
  http.get('/api/models/:id/viewer', async ({ params }) => {
    await delay(300);

    const modelId = params.id as string;
    const data = mockDataMap[modelId];

    if (!data) {
      return HttpResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    return HttpResponse.json(data);
  }),

  // GET /api/models/:id/quiz - 퀴즈 조회
  http.get('/api/models/:id/quiz', async ({ params, request }) => {
    await delay(200);

    const modelId = params.id as string;

    if (!mockDataMap[modelId]) {
      return HttpResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    const url = new URL(request.url);
    const count = parseInt(url.searchParams.get('count') || '3', 10);

    return HttpResponse.json(mockQuizzes.slice(0, count));
  }),

  // POST /api/models/:id/quiz/answer - 퀴즈 답안 제출
  http.post('/api/models/:id/quiz/answer', async ({ params, request }) => {
    await delay(300);

    const modelId = params.id as string;

    if (!mockDataMap[modelId]) {
      return HttpResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    const body = (await request.json()) as {
      answers: {
        questionId: number;
        type: string;
        selectedOptionNo?: number;
        subjectiveAnswer?: string;
      }[];
    };

    const results = (body.answers || []).map((answer) => ({
      questionId: answer.questionId,
      userSelected: answer.selectedOptionNo ?? answer.subjectiveAnswer ?? null,
      correctAnswer:
        answer.type === 'MULTIPLE_CHOICE'
          ? '보기 3 (정답)'
          : '[Mock] 정답 예시입니다.',
      explanation: '[Mock] 해설 목데이터입니다.',
      correct: true,
    }));

    return HttpResponse.json({ results });
  }),

  // POST /api/chat/messages - AI 질의
  http.post('/api/chat/messages', async ({ request }) => {
    await delay(400);

    const body = (await request.json()) as MessageRequest;
    const modelTitle = body.model?.title ?? '알 수 없음';
    const selectedParts =
      body.parts?.map((p) => p.partId).join(', ') || '없음';

    return HttpResponse.json({
      answer: `[Mock AI 응답] 모델: ${modelTitle}, 선택 파트: ${selectedParts}\n"${body.message}"에 대한 응답입니다.`,
      citations: [],
    });
  }),

  // POST /api/models/:id/pdf - PDF 생성 (미리보기/다운로드)
  http.post('/api/models/:id/pdf', async ({ params, request }) => {
    await delay(500);

    const modelId = params.id as string;

    if (!mockDataMap[modelId]) {
      return HttpResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'download';
    const body = (await request.json()) as PdfRequestDto;

    console.log(
      `[MSW] PDF ${type} for model ${modelId}:`,
      JSON.stringify({
        hasModelImage: !!body.modelImage,
        hasMemo: !!body.memo,
        chatLogCount: body.chatLogs?.length ?? 0,
        quizCount: body.quizs?.length ?? 0,
      })
    );

    // 최소한의 유효한 PDF 바이너리 (빈 1-page PDF)
    const pdfContent =
      '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n' +
      '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n' +
      '3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\n' +
      'xref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n' +
      '0000000058 00000 n \n0000000115 00000 n \n' +
      'trailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF';

    const pdfBytes = new TextEncoder().encode(pdfContent);

    return new HttpResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${type === 'preview' ? 'inline' : 'attachment'}; filename="${modelId}_report.pdf"`,
      },
    });
  }),

];
