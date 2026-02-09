'use client';
import { useState, useEffect } from 'react';
import {
  FullscreenIcon,
  MinimizeIcon,
  RedoIcon,
  UndoIcon,
} from '@/components/icons/sidebar-icons';

interface RotationControlsProps {
  isRotatingLeft: boolean;
  isRotatingRight: boolean;
  isFullscreen?: boolean;
  onRotateLeftStart: () => void;
  onRotateLeftEnd: () => void;
  onRotateRightStart: () => void;
  onRotateRightEnd: () => void;
  onToggleFullscreen?: () => void;
}

export function RotationControls({
  isRotatingLeft,
  isRotatingRight,
  isFullscreen,
  onRotateLeftStart,
  onRotateLeftEnd,
  onRotateRightStart,
  onRotateRightEnd,
  onToggleFullscreen,
}: RotationControlsProps) {
  return (
    <div
      className="absolute flex items-center z-10 transition-[top,right] duration-500 ease-in-out"
      style={{
        top: isFullscreen ? '20px' : '120px',
        right: isFullscreen ? '20px' : '418px',
      }}
    >
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
        <UndoIcon className="w-8 h-8" />
      </button>
      <div className="w-3" />
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
        <RedoIcon className="w-8 h-8" />
      </button>
      <div className="w-8" />
      <button
        className="w-12 h-12 rounded-xl bg-[#595959] flex items-center justify-center text-[#FAFAFA] hover:bg-[#6b6b6b] transition-colors"
        onClick={onToggleFullscreen}
        title={isFullscreen ? '전체화면 종료' : '전체화면'}
      >
        {isFullscreen ? (
          <MinimizeIcon className="w-8 h-8" />
        ) : (
          <FullscreenIcon className="w-8 h-8" />
        )}
      </button>
    </div>
  );
}

interface SliderCardProps {
  title: string;
  value: number;
  onChange: (value: number) => void;
}

function SliderCard({ title, value, onChange }: SliderCardProps) {
  // 1. 내부 상태 생성 (즉각 반응용)
  const [localValue, setLocalValue] = useState(value);

  // 2. 부모의 값이 (초기화 등으로) 바뀌면 내부 값도 맞춰줌
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // 3. 내부 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    
    // ① UI 즉시 업데이트 (여기서 렉이 사라짐!)
    setLocalValue(newValue);
    
    // ② 부모(3D 로직)에게 값 전달
    onChange(newValue);
  };

  return (
    <div
      className="w-[360px] h-[126px] rounded-[20px] px-[22px] pt-[18px] pb-[20px] flex flex-col justify-between"
      style={{
        background:
          'linear-gradient(180deg, rgba(7, 11, 20, 0.25) 0%, rgba(4, 10, 46, 0.2) 100%)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
    >
      <div>
        <p className="text-[15px] font-bold text-[#FAFAFA] leading-tight">
          {title}
        </p>
        <p className="text-[13px] text-[#FAFAFA] mt-1">{localValue}%</p>
      </div>

      <div className="relative h-[20px] flex items-center">
        <div className="w-full h-[5px] bg-[#FAFAFA] rounded-full" />

        <input
          type="range"
          min="0"
          max="100"
          value={localValue}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-[#FAFAFA] rounded-full pointer-events-none"
          style={{
            left: `calc(${localValue}% - 10px)`,
            boxShadow:
              '2px 2px 20px rgba(23, 37, 84, 1), -2px -2px 20px rgba(23, 37, 84, 1)',
          }}
        />
      </div>
    </div>
  );
}

// 보이는 영역 기준 중앙 정렬을 위한 패널 폭 상수
// 좌측: sidebar(72px) + margin(12px) = 84px, 콘텐츠 열림 시 + gap(8px) + panel(320px) = 412px
// 우측: panel(320px) + margin(12px) = 332px
const LEFT_SIDEBAR_WIDTH = 84;
const LEFT_PANEL_EXPANDED_WIDTH = 412;
const RIGHT_PANEL_WIDTH = 332;

interface BottomSlidersProps {
  //defaultValue: number;
  explodeValue: number;
  zoomValue: number;
  onExplodeChange: (value: number) => void;
  onZoomChange: (value: number) => void;
  isFullscreen?: boolean;
  isLeftPanelOpen?: boolean;
  onPointerDown?: () => void;
  onPointerUp?: () => void;
}

export function BottomSliders({
  explodeValue,
  //defaultValue,
  zoomValue,
  onExplodeChange,
  onZoomChange,
  isFullscreen = false,
  isLeftPanelOpen = true,
  onPointerDown,
  onPointerUp,
}: BottomSlidersProps) {
  // 뷰포트 중앙 대비 보이는 영역 중앙의 오프셋: (leftWidth - rightWidth) / 2
  const leftWidth = isLeftPanelOpen
    ? LEFT_PANEL_EXPANDED_WIDTH
    : LEFT_SIDEBAR_WIDTH;
  const offsetPx = isFullscreen ? 0 : (leftWidth - RIGHT_PANEL_WIDTH) / 2;


  return (
    <div
      className="absolute bottom-5 z-10 flex gap-10 transition-[left] duration-300 ease-in-out"
      style={{
        left: `calc(50% + ${offsetPx}px)`,
        transform: 'translateX(-50%)',
      }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <SliderCard
        title="분해도 조절"
        value={explodeValue}
        onChange={onExplodeChange}
      />
      <SliderCard
        title="확대·축소 조절"
        value={zoomValue}
        onChange={onZoomChange}
      />
    </div>
  );
}
