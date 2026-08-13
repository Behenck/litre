/**
 * Datas no formato `YYYY-MM-DD`, sem componente de hora.
 *
 * Um abastecimento acontece num dia; guardar timestamp traria fuso horário para
 * dentro do domínio sem nenhum ganho.
 */

export type IsoDate = string;

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return false;
  // Rejeita datas que "transbordam" (ex.: 2026-02-31 vira 03-03).
  return toIsoDate(parsed) === value;
}

export function toIsoDate(date: Date): IsoDate {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function today(): IsoDate {
  return toIsoDate(new Date());
}

export function isFutureDate(value: IsoDate): boolean {
  return value > today();
}

/** Timestamp ISO completo, usado apenas em campos de auditoria (`updatedAt`). */
export function nowTimestamp(): string {
  return new Date().toISOString();
}
