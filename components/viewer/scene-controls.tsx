'use client';

import { Maximize2, RotateCcw, RotateCw } from 'lucide-react';

interface RotationControlsProps {
  isRotatingLeft: boolean;
  isRotatingRight: boolean;
  onRotateLeftStart: () => void;
  onRotateLeftEnd: () => void;
  onRotateRightStart: () => void;
  onRotateRightEnd: () => void;
  onToggleFullscreen?: () => void;
}

export function RotationControls({
  isRotatingLeft,
  isRotatingRight,
  onRotateLeftStart,
  onRotateLeftEnd,
  onRotateRightStart,
  onRotateRightEnd,
  onToggleFullscreen,
}: RotationControlsProps) {
  return (
    <div className="absolute top-3 right-[418px] flex items-center z-10">
      <button
        className={`w-12 h-12 rounded-xl bg-[#595959] flex items-center justify-center text-[#FAFAFA] hover:bg-[#6b6b6b] transition-colors ${
          isRotatingLeft ? 'bg-[#6b6b6b]' : ''
        }`}
        onMouseDown={onRotateLeftStart}
        onMouseUp={onRotateLeftEnd}
        onMouseLeave={onRotateLeftEnd}
        onTouchStart={onRotateLeftStart}
        onTouchEnd={onRotateLeftEnd}
        title="왼쪽으로 회전"
      >
        <RotateCcw className="w-6 h-6" />
      </button>
      <div className="w-5" />
      <button
        className={`w-12 h-12 rounded-xl bg-[#595959] flex items-center justify-center text-[#FAFAFA] hover:bg-[#6b6b6b] transition-colors ${
          isRotatingRight ? 'bg-[#6b6b6b]' : ''
        }`}
        onMouseDown={onRotateRightStart}
        onMouseUp={onRotateRightEnd}
        onMouseLeave={onRotateRightEnd}
        onTouchStart={onRotateRightStart}
        onTouchEnd={onRotateRightEnd}
        title="오른쪽으로 회전"
      >
        <RotateCw className="w-6 h-6" />
      </button>
      <div className="w-[76px]" />
      <button
        className="w-12 h-12 rounded-xl bg-[#595959] flex items-center justify-center text-[#FAFAFA] hover:bg-[#6b6b6b] transition-colors"
        onClick={onToggleFullscreen}
        title="전체화면"
      >
        <Maximize2 className="w-6 h-6" />
      </button>
    </div>
  );
}

interface BottomSlidersProps {
  explodeValue: number;
  zoomValue: number;
  onExplodeChange: (value: number) => void;
  onZoomChange: (value: number) => void;
}

export function BottomSliders({
  explodeValue,
  zoomValue,
  onExplodeChange,
  onZoomChange,
}: BottomSlidersProps) {
  return (
    <div className="absolute bottom-5 left-[406px] right-[418px] z-10">
      <div className="flex gap-12">
        <div className="flex-1 flex flex-col items-start">
          <span className="text-[13px] font-bold text-[#FAFAFA]">분해도</span>
          <span className="text-[11px] text-[#FAFAFA]/80 mt-1">
            {explodeValue}%
          </span>
          <div className="w-full relative h-5 flex items-center mt-1.5">
            <div className="w-full h-[3px] bg-[#FAFAFA]/50 rounded-full" />
            <input
              type="range"
              min="0"
              max="100"
              value={explodeValue}
              onChange={(e) => onExplodeChange(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[#FAFAFA] rounded-full pointer-events-none transition-all duration-150"
              style={{
                left: `calc(${explodeValue}% - 8px)`,
                boxShadow: '2px 2px 20px #172554, -2px -2px 20px #172554',
              }}
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col items-start">
          <span className="text-[13px] font-bold text-[#FAFAFA] uppercase tracking-wider">
            ZOOM
          </span>
          <span className="text-[11px] text-[#FAFAFA]/80 mt-1">IN</span>
          <div className="w-full relative h-5 flex items-center mt-1.5">
            <div className="w-full h-[3px] bg-[#FAFAFA]/50 rounded-full" />
            <input
              type="range"
              min="0"
              max="100"
              value={zoomValue}
              onChange={(e) => onZoomChange(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[#FAFAFA] rounded-full pointer-events-none transition-all duration-150"
              style={{
                left: `calc(${zoomValue}% - 8px)`,
                boxShadow: '2px 2px 20px #172554, -2px -2px 20px #172554',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
