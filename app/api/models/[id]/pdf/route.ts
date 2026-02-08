import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: modelId } = await params;
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'download';

  try {
    const body = await request.json();

    const response = await fetch(
      `${API_BASE_URL}/api/models/${modelId}/pdf?type=${encodeURIComponent(type)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    const pdfBuffer = await response.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition':
          response.headers.get('Content-Disposition') ||
          `${type === 'preview' ? 'inline' : 'attachment'}; filename="${modelId}_report.pdf"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to connect to backend' },
      { status: 500 }
    );
  }
}
