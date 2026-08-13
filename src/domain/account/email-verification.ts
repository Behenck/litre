/**
 * Convite de confirmação de e-mail.
 *
 * O link enviado carrega um token aleatório; o banco guarda só o hash dele.
 * Quem confirma prova que recebeu o e-mail — o token vale uma vez e vence.
 */

import type { Id } from '../shared/id';
import { nowTimestamp } from '../shared/iso-date';

export interface EmailVerification {
  /** SHA-256 do token que foi para o e-mail. É a chave do registro. */
  readonly tokenHash: string;
  readonly userId: Id;
  readonly expiresAt: string;
  readonly createdAt: string;
}

export interface EmailVerificationInput {
  readonly tokenHash: string;
  readonly userId: Id;
  readonly expiresAt?: string;
  readonly createdAt?: string;
}

/** Vinte e quatro horas: tempo de sobra para abrir o e-mail, curto para vazar. */
export const VERIFICATION_TTL_SECONDS = 60 * 60 * 24;

export function createEmailVerification(input: EmailVerificationInput): EmailVerification {
  const createdAt = input.createdAt ?? nowTimestamp();
  return {
    tokenHash: input.tokenHash,
    userId: input.userId,
    expiresAt: input.expiresAt ?? new Date(Date.parse(createdAt) + VERIFICATION_TTL_SECONDS * 1000).toISOString(),
    createdAt,
  };
}

export function isVerificationExpired(verification: EmailVerification, now: string = nowTimestamp()): boolean {
  return verification.expiresAt <= now;
}
