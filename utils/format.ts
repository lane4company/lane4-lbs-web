import dayjs from 'dayjs';

export function formatDateTime(
  value?: string | number | null,
  template = 'YYYY-MM-DD HH:mm:ss',
): string {
  if (value === null || value === undefined || value === '') return '-';
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format(template) : '-';
}

export function formatDate(value?: string | number | null): string {
  return formatDateTime(value, 'YYYY-MM-DD');
}

export function formatCoordinate(value?: number | null): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '-';
  return value.toFixed(6);
}

export function formatNumber(value?: number | null): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '-';
  return value.toLocaleString('ko-KR');
}

/** 남은 시간(ms) → mm:ss */
export function formatMmSs(totalMs: number): string {
  const clamped = Math.max(0, totalMs);
  const totalSec = Math.floor(clamped / 1000);
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
