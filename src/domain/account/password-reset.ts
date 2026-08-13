/**
 * Convite de redefinição de senha.
 *
 * Mesmo desenho do convite de confirmação de e-mail: o link carrega um token
 * aleatório, o banco guarda só o hash. Prazo curto porque, ao contrário da
 * confirmação de cadastro, esse link move dinheiro nenhum mas abre a conta.
 */

import type { Id } from '../shared/id';
import { nowTimestamp } from '../shared/iso-date';

export interface PasswordReset {
  /** SHA-256 do token que foi para o e-mail. É a chave do registro. */
  readonly tokenHash: string;
  readonly userId: Id;
  readonly expiresAt: string;
  readonly createdAt: string;
}

export interface PasswordResetInput {
  readonly tokenHash: string;
  readonly userId: Id;
  readonly expiresAt?: string;
  readonly createdAt?: string;
}

/** Uma hora: tempo de sobra para abrir o e-mail, curto para um link esquecido virar risco. */
export const PASSWORD_RESET_TTL_SECONDS = 60 * 60;

export function createPasswordReset(input: PasswordResetInput): PasswordReset {
  const createdAt = input.createdAt ?? nowTimestamp();
  return {
    tokenHash: input.tokenHash,
    userId: input.userId,
    expiresAt: input.expiresAt ?? new Date(Date.parse(createdAt) + PASSWORD_RESET_TTL_SECONDS * 1000).toISOString(),
    createdAt,
  };
}

export function isPasswordResetExpired(reset: PasswordReset, now: string = nowTimestamp()): boolean {
  return reset.expiresAt <= now;
}
