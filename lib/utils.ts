import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * CommonMark에서 **bold(괄호)**한글 패턴이 right-flanking delimiter로
 * 인식되지 않는 edge case를 HTML <strong> 태그로 변환하여 해결합니다.
 */
export function fixMarkdownBold(text: string): string {
  // **...** 패턴을 <strong>...</strong>으로 변환
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}
