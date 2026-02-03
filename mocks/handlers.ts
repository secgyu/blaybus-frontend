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

export const handlers = [
  // GET /api/models - 모델 목록 조회
  http.get('/api/models', async () => {
    await delay(100);

    const models: ModelSummary[] = Object.values(mockDataMap).map((data) => ({
      modelId: data.model.modelId,
      title: data.model.title,
      thumbnailUrl: data.model.thumbnailUrl,
      overview: data.model.overview,
    }));

    return HttpResponse.json(models);
  }),

  // GET /api/models/:id/viewer - model + parts + nodes 데이터
  http.get('/api/models/:id/viewer', async ({ params }) => {
    await delay(100);

    const modelId = params.id as string;
    const data = mockDataMap[modelId];

    if (!data) {
      return HttpResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    return HttpResponse.json(data);
  }),

  // POST /api/models/:id/chat - AI 질의 (스트리밍 mock)
  http.post('/api/models/:id/chat', async ({ params, request }) => {
    await delay(200);

    const modelId = params.id as string;
    const body = (await request.json()) as {
      messages: Array<{ role: string; content: string }>;
      partId?: string;
    };
    const lastMessage =
      body.messages?.[body.messages.length - 1]?.content || '';

    // Get system prompt for the model
    const systemPrompt =
      systemPrompts[modelId] ||
      '당신은 SIMVEX의 공학 교육 어시스턴트입니다. 한국어로 친절하게 답변해주세요.';

    // Generate mock response based on the question
    let mockResponse = '';

    if (lastMessage.includes('역할') || lastMessage.includes('기능')) {
      mockResponse = `해당 부품은 조립체에서 중요한 역할을 합니다. 구조적 지지와 기능적 연결을 담당하며, 다른 부품들과 함께 전체 시스템의 작동을 가능하게 합니다.`;
    } else if (lastMessage.includes('재질') || lastMessage.includes('소재')) {
      mockResponse = `일반적으로 이런 부품은 강도와 내구성이 요구되어 강철이나 알루미늄 합금으로 제작됩니다. 특수한 경우 탄소섬유나 티타늄 합금이 사용되기도 합니다.`;
    } else if (lastMessage.includes('조립') || lastMessage.includes('분해')) {
      mockResponse = `조립/분해 시에는 정해진 순서를 따르는 것이 중요합니다. 먼저 고정 부품을 배치한 후, 연결 부품을 순차적으로 조립합니다. 분해는 역순으로 진행합니다.`;
    } else {
      mockResponse = `좋은 질문입니다! ${systemPrompt.split('\n')[0]} 이 모델에 대해 더 궁금한 점이 있으시면 언제든 질문해주세요.`;
    }

    // Create SSE stream response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Send response in chunks to simulate streaming
        const chunks = mockResponse.split(' ');
        for (const chunk of chunks) {
          const data = JSON.stringify({
            type: 'text-delta',
            delta: chunk + ' ',
          });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          await delay(30);
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });

    return new HttpResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
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
