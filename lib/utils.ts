import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatNumber = (num: number | undefined): string => {
  if (num === undefined) return '0';
  return num.toLocaleString('tr-TR');
};

export const formatSizeToMB = (bytes: number | undefined): string => {
  if (bytes === undefined) return '0';
  const mb = bytes / 1024 / 1024;
  return mb.toLocaleString('tr-TR', { maximumFractionDigits: 1 });
};
