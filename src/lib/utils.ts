import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * @desc Tailwind 클래스를 병합하고 조건부 스타일링을 쉽게 처리하는 유틸리티
 * @example cn('px-2 py-1', isSelected && 'bg-blue-500')
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
