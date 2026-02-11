import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fixMarkdownBold(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

export function formatModelName(modelId: string): string {
  return modelId.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
