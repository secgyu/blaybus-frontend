import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

function toAbsoluteUrl(path: string): string {
  if (!path) return path;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE_URL}${path}`;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: modelId } = await params;

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/api/models/${modelId}/viewer`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Model not found' }, { status: 404 });
      }
      return NextResponse.json(
        { error: `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (data.model?.thumbnailUrl) {
      data.model.thumbnailUrl = toAbsoluteUrl(data.model.thumbnailUrl);
    }
    if (data.parts) {
      data.parts = data.parts.map(
        (part: { glbUrl?: string; [key: string]: unknown }) => ({
          ...part,
          glbUrl: part.glbUrl ? toAbsoluteUrl(part.glbUrl) : part.glbUrl,
        })
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Failed to connect to backend' },
      { status: 500 }
    );
  }
}
