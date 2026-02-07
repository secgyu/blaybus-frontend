import { HttpResponse, delay, http } from 'msw';

import type { Model, ModelData, Node, Part } from '@/types/model';

import DroneData from './model/Dron.json';
import LeafSpringData from './model/Leaf_Spring.json';
import MachineViceData from './model/Machine_Vice.json';
import RobotArmData from './model/Robot_Arm.json';
import RobotGripperData from './model/Robot_Gripper.json';
import SuspensionData from './model/Suspension.json';
// Import mock data JSON files
import V4EngineData from './model/V4_Engine.json';

// System prompts for AI chat
const systemPrompts: Record<string, string> = {
  v4_engine: `당신은 SIMVEX의 공학 교육 어시스턴트입니다. 현재 사용자는 V4 실린더 엔진을 학습하고 있습니다.

크랭크샤프트의 회전 운동이 커넥팅 로드를 통해 피스톤의 왕복 운동으로 변환되는 과정을 3D로 확인합니다.

V4 엔진은 4개의 실린더가 V자 형태로 배치된 내연기관입니다. 주요 작동 원리:
1. 흡입 행정: 피스톤이 하강하며 공기-연료 혼합물 흡입
2. 압축 행정: 피스톤이 상승하며 혼합물 압축
3. 폭발 행정: 점화 플러그에 의한 연소로 피스톤 하강
4. 배기 행정: 피스톤 상승으로 연소 가스 배출

학생들에게 친절하고 명확하게 설명해주세요. 한국어로 답변하세요.`,
  suspension: `당신은 SIMVEX의 공학 교육 어시스턴트입니다. 현재 사용자는 서스펜션을 학습하고 있습니다.

서스펜션의 특징:
- 스프링이 충격을 흡수하고 차체를 지지
- 쇼크업소버(댐퍼)가 진동을 감쇠
- 차량의 승차감과 조종 안정성에 핵심적 역할
- 다양한 형식: 맥퍼슨, 더블위시본, 멀티링크 등

학생들에게 친절하고 명확하게 설명해주세요. 한국어로 답변하세요.`,
  drone: `당신은 SIMVEX의 공학 교육 어시스턴트입니다. 현재 사용자는 쿼드콥터 드론을 학습하고 있습니다.

드론의 비행 원리:
- 4개의 모터가 프로펠러를 회전시켜 양력 생성
- 대각선 모터는 같은 방향, 인접 모터는 반대 방향 회전
- 모터 속도 차이로 롤, 피치, 요 제어
- 비행 컨트롤러의 PID 제어로 안정적 비행

학생들에게 친절하고 명확하게 설명해주세요. 한국어로 답변하세요.`,
  robot_arm: `당신은 SIMVEX의 공학 교육 어시스턴트입니다. 현재 사용자는 6축 산업용 로봇팔을 학습하고 있습니다.

6축 로봇팔의 특징:
- 6개의 회전 관절로 6 자유도(DOF) 구현
- 역기구학으로 목표 위치/자세에 필요한 관절 각도 계산
- 서보 모터와 감속기로 정밀한 위치 제어
- 주로 용접, 조립, 도장 등 산업 자동화에 사용

학생들에게 친절하고 명확하게 설명해주세요. 한국어로 답변하세요.`,
  robot_gripper: `당신은 SIMVEX의 공학 교육 어시스턴트입니다. 현재 사용자는 로봇 그리퍼를 학습하고 있습니다.

그리퍼의 종류와 특징:
- 2핑거 그리퍼: 가장 일반적, 평행 또는 각도 방식
- 3핑거 그리퍼: 원형 물체에 적합
- 진공 그리퍼: 평면 물체 핸들링
- 소프트 그리퍼: 민감한 물체용

학생들에게 친절하고 명확하게 설명해주세요. 한국어로 답변하세요.`,
  leaf_spring: `당신은 SIMVEX의 공학 교육 어시스턴트입니다. 현재 사용자는 판스프링 서스펜션을 학습하고 있습니다.

판스프링의 특징:
- 여러 겹의 강판이 겹쳐진 구조
- 스프링과 서스펜션 링크 역할 동시 수행
- 높은 하중 용량으로 트럭, 버스에 주로 사용
- 판 사이 마찰로 자체 감쇠 효과

학생들에게 친절하고 명확하게 설명해주세요. 한국어로 답변하세요.`,
  machine_vice: `당신은 SIMVEX의 공학 교육 어시스턴트입니다. 현재 사용자는 공작기계 바이스를 학습하고 있습니다.

바이스의 특징:
- 리드 스크류의 나사 원리로 강한 클램핑력 발생
- ACME 나사는 사다리꼴 단면으로 높은 하중 전달
- 정밀 바이스는 ±0.01mm 정확도
- 스위블 베이스로 각도 조절 가능한 모델도 있음

학생들에게 친절하고 명확하게 설명해주세요. 한국어로 답변하세요.`,
};

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

// Model summary type for list endpoint
interface ModelSummary {
  modelId: string;
  title: string;
  thumbnailUrl: string;
  overview: string;
}

// --- GLB URL 정규화 (공백 → 언더스코어) ---
const MODEL_FOLDER_MAP: Record<string, string> = {
  v4_engine: 'V4_Engine',
  suspension: 'Suspension',
  robot_gripper: 'Robot_Gripper',
  drone: 'Drone',
  robot_arm: 'Robot_Arm',
  leaf_spring: 'Leaf_Spring',
  machine_vice: 'Machine_Vice',
};

function normalizeGlbUrl(glbUrl: string, modelId: string): string {
  if (!glbUrl || glbUrl.startsWith('http')) return glbUrl;
  const folder = MODEL_FOLDER_MAP[modelId] || modelId;
  const filename = glbUrl.split('/').pop()!.replace(/ /g, '_');
  return `/models/${folder}/${filename}`;
}

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

    // glbUrl 정규화 (공백 → 언더스코어)
    const normalized = {
      ...data,
      parts: data.parts.map((part: Part) => ({
        ...part,
        glbUrl: part.glbUrl ? normalizeGlbUrl(part.glbUrl, modelId) : part.glbUrl,
      })),
    };

    return HttpResponse.json(normalized);
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

  // POST /api/models/:id/chat - AI 질의
  http.post('/api/models/:id/chat', async ({ params, request }) => {
    // 0.4초 delay
    await delay(400);

    const modelId = params.id as string;
    const body = (await request.json()) as {
      message: string;
      history: string[];
    };

    // 모델이 존재하지 않으면 404
    if (!mockDataMap[modelId]) {
      return HttpResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    // 단순 mock 응답
    return HttpResponse.json({
      content: '[AI 답변내용]',
    });
  }),

  // PUT /admin/models/:id/nodes - 배치(노드) 저장
  http.put('/admin/models/:id/nodes', async ({ params, request }) => {
    await delay(100);

    const modelId = params.id as string;
    const body = (await request.json()) as { nodes: Node[] };

    if (!mockDataMap[modelId]) {
      return HttpResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    // In a real implementation, this would save to database
    // For mock, just return success
    console.log(
      `[MSW] Saving nodes for model ${modelId}:`,
      body.nodes?.length || 0,
      'nodes'
    );

    return HttpResponse.json({
      success: true,
      message: `${body.nodes?.length || 0} nodes saved successfully`,
    });
  }),
];
