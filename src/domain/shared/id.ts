/**
 * Identificadores gerados no domínio (nunca pelo banco).
 *
 * Manter a geração aqui é o que permite trocar SQLite por Supabase sem depender
 * de autoincremento nem de ida ao banco antes de compor a entidade.
 */

export type Id = string;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function newId(): Id {
  return crypto.randomUUID();
}

export function isValidId(value: string): boolean {
  return UUID_PATTERN.test(value);
}
