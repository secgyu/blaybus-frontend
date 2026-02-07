'use client';

interface PartTooltipProps {
  part: {
    nameKo: string;
    role: string;
  };
}

export function PartTooltip({ part }: PartTooltipProps) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 glass-panel px-4 py-2 pointer-events-none z-10">
      <p className="text-sm font-medium text-primary">{part.nameKo}</p>
      <p className="text-xs text-muted-foreground max-w-xs truncate">
        {part.role}
      </p>
    </div>
  );
}
