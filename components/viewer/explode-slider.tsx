'use client';

interface ExplodeSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function ExplodeSlider({ value, onChange }: ExplodeSliderProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">분해도</span>
        <span className="text-xs font-mono text-primary">{value}%</span>
      </div>

      <div className="relative">
        {/* Track */}
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          {/* Filled portion */}
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-primary rounded-full transition-all duration-150"
            style={{ width: `${value}%` }}
          />
        </div>

        {/* Custom range input */}
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {/* Thumb indicator */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow-[0_0_10px_rgba(0,212,255,0.6)] pointer-events-none transition-all duration-150"
          style={{ left: `calc(${value}% - 8px)` }}
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>조립</span>
        <span>분해</span>
      </div>
    </div>
  );
}
