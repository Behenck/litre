import type { IsoDate } from '@/domain/shared/iso-date';

/**
 * Datas em pt-BR.
 *
 * As datas chegam como `YYYY-MM-DD` e são interpretadas como hora local para
 * não "voltar um dia" por causa de fuso.
 */

const MONTHS_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'] as const;

function toLocalDate(value: IsoDate): Date {
  return new Date(`${value}T00:00:00`);
}

export function formatDate(value: IsoDate): string {
  return toLocalDate(value).toLocaleDateString('pt-BR');
}

export function formatDayNumber(value: IsoDate): string {
  return String(toLocalDate(value).getDate()).padStart(2, '0');
}

export function formatMonthShort(value: IsoDate): string {
  return MONTHS_SHORT[toLocalDate(value).getMonth()] ?? '';
}

/** "hoje", "ontem", "há 3 dias", "há 2 semanas" — para a atualização de preços. */
export function formatRelative(isoTimestamp: string): string {
  const then = new Date(isoTimestamp);
  if (Number.isNaN(then.getTime())) return '';

  const days = Math.floor((Date.now() - then.getTime()) / 86_400_000);
  if (days <= 0) return 'hoje';
  if (days === 1) return 'ontem';
  if (days < 7) return `há ${days} dias`;
  if (days < 14) return 'há 1 semana';
  if (days < 30) return `há ${Math.floor(days / 7)} semanas`;
  if (days < 60) return 'há 1 mês';
  return `há ${Math.floor(days / 30)} meses`;
}
