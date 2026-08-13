/**
 * Conversão de números digitados no padrão brasileiro.
 *
 * Esta é a única porta de entrada de números vindos do usuário: aceita
 * "32,4", "1.248,50" e também "1248.50" (teclado numérico de celular).
 */

import { fail, ok, type Result } from './result';

const ONLY_DIGITS_SEPARATORS = /^-?[\d.,]+$/;

/**
 * Normaliza a string para o formato aceito por `Number`.
 *
 * Regra: a vírgula sempre decide o decimal. Sem vírgula, um único ponto com até
 * duas casas à direita também é tratado como decimal ("1248.50"); caso contrário
 * os pontos são separadores de milhar ("1.248").
 */
function normalize(raw: string): string {
  const trimmed = raw.trim().replace(/\s/g, '');

  if (trimmed.includes(',')) {
    return trimmed.replace(/\./g, '').replace(',', '.');
  }

  const dots = trimmed.split('.').length - 1;
  if (dots === 1) {
    const decimals = trimmed.split('.')[1] ?? '';
    if (decimals.length !== 3) return trimmed;
  }
  return trimmed.replace(/\./g, '');
}

/** Converte texto em número decimal. Campo vazio é erro — quem permite vazio trata antes. */
export function parseDecimalPtBr(raw: string, field?: string): Result<number> {
  const trimmed = raw.trim();
  if (trimmed === '') {
    return fail('campo-obrigatorio', 'Informe um valor.', field);
  }
  if (!ONLY_DIGITS_SEPARATORS.test(trimmed)) {
    return fail('valor-invalido', 'Use apenas números, com vírgula para os centavos.', field);
  }

  const parsed = Number(normalize(trimmed));
  if (!Number.isFinite(parsed)) {
    return fail('valor-invalido', 'Número inválido.', field);
  }
  return ok(parsed);
}

/** Converte texto em centavos inteiros, evitando erro de ponto flutuante em reais. */
export function parseMoneyPtBr(raw: string, field?: string): Result<number> {
  const parsed = parseDecimalPtBr(raw, field);
  if (!parsed.ok) return parsed;
  return ok(Math.round(parsed.value * 100));
}

/** Versão tolerante: devolve `null` quando o campo está vazio. */
export function parseOptionalDecimalPtBr(raw: string, field?: string): Result<number | null> {
  if (raw.trim() === '') return ok(null);
  return parseDecimalPtBr(raw, field);
}

/** Versão tolerante para dinheiro: devolve `null` quando o campo está vazio. */
export function parseOptionalMoneyPtBr(raw: string, field?: string): Result<number | null> {
  if (raw.trim() === '') return ok(null);
  return parseMoneyPtBr(raw, field);
}
