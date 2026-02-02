import { NextResponse } from 'next/server';

import { mockDataMap } from '../../route';

// GET /api/models/:id/viewer - model + parts + nodes 데이터
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: modelId } = await params;
  const data = mockDataMap[modelId];

  if (!data) {
    return NextResponse.json({ error: 'Model not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}
