import { parseDecimalPtBr, parseMoneyPtBr } from '@/domain/shared/number-parser';
import type { Result } from '@/domain/shared/result';

/**
 * Leitura de `FormData`.
 *
 * A fronteira só extrai e converte forma; qualquer julgamento sobre o valor é
 * do domínio.
 */

export function text(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

export function checkbox(form: FormData, name: string): boolean {
  return form.get(name) !== null;
}

export function integer(form: FormData, name: string): number | null {
  const raw = text(form, name);
  if (raw === '') return null;
  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

/** Decimal obrigatório em formato pt-BR. */
export function decimal(form: FormData, name: string, field: string): Result<number> {
  return parseDecimalPtBr(text(form, name), field);
}

/** Decimal opcional: campo vazio vira 0 (usado na quilometragem inicial). */
export function decimalOrZero(form: FormData, name: string, field: string): Result<number> {
  const raw = text(form, name);
  if (raw === '') return { ok: true, value: 0 };
  return parseDecimalPtBr(raw, field);
}

/** Valor monetário obrigatório, convertido para centavos. */
export function money(form: FormData, name: string, field: string): Result<number> {
  return parseMoneyPtBr(text(form, name), field);
}
