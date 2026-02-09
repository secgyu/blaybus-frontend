import { notFound } from 'next/navigation';

import { ComingSoonPage } from '@/components/viewer/coming-soon-page';
import { ViewerPage } from '@/components/viewer/viewer-page';
import { fetchViewerDataServer } from '@/lib/api';
import { getSystemPrompt } from '@/lib/constants/system-prompts';
import { toViewerModel } from '@/lib/transform';

const COMING_SOON_IDS: Record<string, string> = {
  bio_dna_helix: '생명공학',
  bio_cell_structure: '생명공학',
  bio_protein_folding: '생명공학',
  med_artificial_joint: '의공학',
  med_prosthetic_hand: '의공학',
  med_stent: '의공학',
};

interface PageProps {
  params: Promise<{ modelId: string }>;
}

export default async function StudyPage({ params }: PageProps) {
  const { modelId } = await params;

  if (COMING_SOON_IDS[modelId]) {
    return (
      <ComingSoonPage
        modelId={modelId}
        categoryTitle={COMING_SOON_IDS[modelId]}
      />
    );
  }

  let model;
  try {
    const data = await fetchViewerDataServer(modelId);
    const systemPrompt = getSystemPrompt(modelId);
    model = toViewerModel(data, systemPrompt);
  } catch {
    notFound();
  }

  return <ViewerPage model={model} modelId={modelId} />;
}
