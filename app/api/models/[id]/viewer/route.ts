import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

const MODEL_FOLDER_MAP: Record<string, string> = {
  v4_engine: 'V4_Engine',
  suspension: 'Suspension',
  robot_gripper: 'Robot_Gripper',
  drone: 'Drone',
  robot_arm: 'Robot_Arm',
  leaf_spring: 'Leaf_Spring',
  machine_vice: 'Machine_Vice',
};

function convertGlbUrl(glbUrl: string, modelId: string): string {
  if (!glbUrl) return glbUrl;
  if (glbUrl.startsWith('http://') || glbUrl.startsWith('https://')) {
    return glbUrl;
  }
  const folder = MODEL_FOLDER_MAP[modelId] || modelId;
  const filename = glbUrl.replace(/^\/glb\//, '');
  return `/models/${folder}/${filename}`;
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

    if (data.parts) {
      data.parts = data.parts.map(
        (part: { glbUrl?: string; [key: string]: unknown }) => ({
          ...part,
          glbUrl: part.glbUrl
            ? convertGlbUrl(part.glbUrl, modelId)
            : part.glbUrl,
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
