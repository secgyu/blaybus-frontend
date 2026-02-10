'use client';

import { useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import { fetchModels } from '@/lib/api';

function formatModelName(modelId: string): string {
  return modelId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function SimvexLogo() {
  return (
    <svg
      width="28"
      height="38"
      viewBox="49 26 38 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M68.8389 43.5516V61.2913L84.5409 53.0208L84.3012 35.6406L68.8389 43.5516Z"
        stroke="url(#logo_paint0)"
        strokeWidth="1.19863"
      />
      <path
        d="M84.5411 53.0205L65.7226 43.8764M50.5 36.4795L61.7671 30.8459M50.5 36.4795V50.9829M50.5 36.4795L65.7226 43.8764M68.9589 27.25L84.5411 35.161M68.9589 27.25V40.7945M68.9589 27.25L61.7671 30.8459M61.7671 30.8459V52.1815L50.5 58.0548V50.9829M50.5 50.9829L65.7226 43.8764M50.5 50.9829L68.9589 59.9726"
        stroke="url(#logo_paint1)"
        strokeWidth="1.19863"
      />
      <g filter="url(#logo_filter0)">
        <circle cx="84.4225" cy="35.5202" r="1.07877" fill="#FAFAFA" />
      </g>
      <path
        d="M50.5 36.7195L61.7671 31.0859V52.4216L50.5 58.2948V51.2229M50.5 36.7195V51.2229M50.5 36.7195L65.7226 44.1164L50.5 51.2229"
        stroke="url(#logo_paint2)"
        strokeWidth="1.19863"
      />
      <path
        d="M54.6038 69.3267C54.5496 68.8115 54.1338 68.5041 53.4739 68.5041C52.7869 68.5041 52.4073 68.8205 52.3982 69.2544C52.3892 69.7244 52.8864 69.9414 53.4468 70.0679L54.0343 70.2126C55.1552 70.4657 55.9959 71.0351 55.9959 72.1289C55.9959 73.3311 55.0558 74.0904 53.4649 74.0904C51.883 74.0904 50.8706 73.3582 50.8345 71.9571H52.1542C52.1994 72.617 52.7237 72.9514 53.4468 72.9514C54.1609 72.9514 54.6219 72.617 54.6219 72.1289C54.6219 71.686 54.2151 71.478 53.501 71.2973L52.7869 71.1255C51.6841 70.8543 51.0062 70.3029 51.0062 69.3448C51.0062 68.1516 52.0548 67.3652 53.483 67.3652C54.9292 67.3652 55.8874 68.1697 55.9055 69.3267H54.6038ZM58.2376 67.4556V74H56.8817V67.4556H58.2376ZM59.3404 67.4556H61.0217L62.8386 71.8939H62.9109L64.7278 67.4556H66.4091V74H65.0894V69.7154H65.0351L63.3267 73.9729H62.4228L60.7144 69.6973H60.6601V74H59.3404V67.4556ZM68.6599 67.4556L70.2508 72.4452H70.314L71.914 67.4556H73.4145L71.1547 74H69.4101L67.1413 67.4556H68.6599ZM74.1557 74V67.4556H78.5488V68.5764H75.5116V70.1674H78.3228V71.2882H75.5116V72.8791H78.5578V74H74.1557ZM80.8629 67.4556L82.2007 69.7064H82.2459L83.5927 67.4556H85.1294L83.1317 70.7278L85.1746 74H83.6018L82.2459 71.7492H82.2007L80.8448 74H79.281L81.3329 70.7278L79.3171 67.4556H80.8629Z"
        fill="url(#logo_paint3)"
      />
      <defs>
        <filter
          id="logo_filter0"
          x="76.152"
          y="27.2496"
          width="16.5408"
          height="16.5418"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feMorphology
            radius="2.39726"
            operator="dilate"
            in="SourceAlpha"
            result="effect1_dropShadow"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="2.39726" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.231373 0 0 0 0 0.509804 0 0 0 0 0.964706 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow"
            result="shape"
          />
        </filter>
        <linearGradient
          id="logo_paint0"
          x1="68.9587"
          y1="44.5105"
          x2="97.606"
          y2="58.4146"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FAFAFA" />
          <stop offset="1" stopColor="#60A5FA" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient
          id="logo_paint1"
          x1="59.7295"
          y1="28.9281"
          x2="59.7295"
          y2="73.1575"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FAFAFA" />
          <stop offset="1" stopColor="#3A80D7" />
        </linearGradient>
        <linearGradient
          id="logo_paint2"
          x1="50.5"
          y1="37.6784"
          x2="62.8459"
          y2="51.9421"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FAFAFA" />
          <stop offset="1" stopColor="#78B5FF" />
        </linearGradient>
        <linearGradient
          id="logo_paint3"
          x1="50.5"
          y1="70.5"
          x2="85.5"
          y2="70.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FAFAFA" />
          <stop offset="0.568828" stopColor="#3B82F6" />
          <stop offset="1" stopColor="#1E40AF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 15.9993C11.767 15.9998 11.54 15.9184 11.36 15.7693L5.36 10.7693C5.156 10.5996 5.028 10.3556 5.003 10.0912C4.979 9.8268 5.061 9.5635 5.23 9.3593C5.4 9.1551 5.644 9.0267 5.908 9.0023C6.173 8.9779 6.436 9.0596 6.64 9.2293L12 13.7093L17.36 9.3893C17.463 9.3062 17.58 9.2442 17.707 9.2068C17.833 9.1693 17.965 9.1572 18.096 9.1712C18.227 9.1851 18.354 9.2248 18.47 9.288C18.586 9.3512 18.688 9.4366 18.77 9.5393C18.862 9.6421 18.931 9.7627 18.974 9.8936C19.017 10.0245 19.032 10.1628 19.019 10.2999C19.006 10.4369 18.965 10.5698 18.898 10.6902C18.831 10.8105 18.74 10.9158 18.63 10.9993L12.63 15.8293C12.445 15.9548 12.223 16.0147 12 15.9993Z"
        fill="#FAFAFA"
      />
    </svg>
  );
}

interface StudyHeaderProps {
  category?: string;
  modelId?: string;
}

export function StudyHeader({
  category = '기계공학',
  modelId,
}: StudyHeaderProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [models, setModels] = useState<{ modelId: string }[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !isLoaded) {
      fetchModels({ size: 50 })
        .then((data) => {
          setModels(data);
          setIsLoaded(true);
        })
        .catch(() => setIsLoaded(true));
    }
  }, [isOpen, isLoaded]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <header className="h-[64px] bg-[#0a0f1a]/50 backdrop-blur-sm border-b border-[#595959]/30 flex items-end pl-6 pb-3">
      <div className="flex items-end gap-8">
        <button
          onClick={() => router.push('/')}
          className="cursor-pointer mb-[-4px]"
        >
          <SimvexLogo />
        </button>

        <div className="flex flex-col">
          <span className="text-base xl:text-[18px] font-semibold text-[#FAFAFA] tracking-wide pb-1.5">
            Study
          </span>
          <div className="h-[2px] bg-[#2563EB] rounded-full" />
        </div>

        <div
          className="relative mb-0.5 ml-[-10px] xl:ml-[-20px]"
          ref={dropdownRef}
        >
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex items-center gap-2 h-[28px] px-4 rounded-full border border-[#595959] text-[#FAFAFA] text-xs cursor-pointer hover:border-[#888] transition-colors"
          >
            {category}
            <ChevronDownIcon />
          </button>

          {isOpen && (
            <div className="absolute top-[calc(100%+8px)] left-0 w-[220px] xl:w-[250px] rounded-xl border border-[#595959]/50 bg-[#0a0f1a]/95 backdrop-blur-md py-3 shadow-xl z-50">
              {[...models]
                .sort((a, b) =>
                  formatModelName(a.modelId).localeCompare(
                    formatModelName(b.modelId)
                  )
                )
                .map((m) => {
                  const isSelected = m.modelId === modelId;
                  return (
                    <button
                      key={m.modelId}
                      onClick={() => {
                        setIsOpen(false);
                        router.push(`/study/${m.modelId}`);
                      }}
                      className={`w-[calc(100%-16px)] mx-2 text-left px-4 py-2.5 text-sm transition-colors cursor-pointer rounded-md ${
                        isSelected
                          ? 'bg-[#E7E5E4] text-[#1A1A1A] font-medium'
                          : 'text-[#FAFAFA] hover:bg-[#FAFAFA]/10'
                      }`}
                    >
                      {formatModelName(m.modelId)}
                    </button>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
