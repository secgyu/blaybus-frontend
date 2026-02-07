import Link from 'next/link';

import { Box, ChevronRight } from 'lucide-react';

import type { ModelSummary } from '@/types/api';

/** modelId를 사람이 읽기 좋은 형태로 변환 (예: "v4_engine" -> "V4 Engine") */
function formatModelId(modelId: string): string {
  return modelId
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

interface ModelCardProps {
  model: ModelSummary;
}

export function ModelCard({ model }: ModelCardProps) {
  return (
    <Link href={`/study/${model.modelId}`} className="group block">
      <div className="glass-panel p-4 h-full transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(0,212,255,0.2)]">
        {/* Thumbnail placeholder */}
        <div className="aspect-square bg-secondary/50 rounded-lg mb-4 flex items-center justify-center overflow-hidden relative">
          <div className="absolute inset-0 grid-bg opacity-50" />
          <Box className="w-12 h-12 text-primary/60 group-hover:text-primary transition-colors relative z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
        </div>

        {/* Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {formatModelId(model.modelId)}
            </h3>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            {model.modelId}
          </p>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {model.overview}
          </p>
        </div>
      </div>
    </Link>
  );
}
