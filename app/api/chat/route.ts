import { convertToModelMessages, streamText } from 'ai';

export async function POST(req: Request) {
  const { messages, systemPrompt, context } = await req.json();

  // Build the complete system prompt with context
  const fullSystemPrompt = `${systemPrompt}

${
  context
    ? `현재 선택된 부품 정보:
- 이름: ${context.partName}
- 역할: ${context.partRole}
- 재질: ${context.partMaterial}

사용자의 질문에 이 부품과 관련된 맥락을 고려하여 답변해주세요.`
    : ''
}

항상 친절하고 명확하게 한국어로 답변해주세요. 기술적인 내용은 쉽게 풀어서 설명해주세요.`;

  const result = streamText({
    model: 'openai/gpt-4o-mini',
    system: fullSystemPrompt,
    messages: await convertToModelMessages(messages),
    maxOutputTokens: 1000,
  });

  return result.toUIMessageStreamResponse();
}
