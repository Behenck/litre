/**
 * Sessão de login guardada no banco.
 *
 * O JWT é só o portador: o que decide se a sessão vale é a linha aqui. Sair da
 * conta apaga a linha e o token vira papel velho, mesmo dentro da validade.
 *
 * `tokenHash` é o SHA-256 do JWT emitido — nem o banco guarda o token inteiro.
 */

import { type Id, newId } from '../shared/id';
import { nowTimestamp } from '../shared/iso-date';

export interface Session {
  readonly id: Id;
  readonly userId: Id;
  readonly tokenHash: string;
  readonly expiresAt: string;
  readonly createdAt: string;
}

export interface SessionInput {
  readonly id?: Id;
  readonly userId: Id;
  readonly tokenHash: string;
  readonly expiresAt: string;
  readonly createdAt?: string;
}

/** Trinta dias: longo o bastante para não pedir senha no posto toda semana. */
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

export function createSession(input: SessionInput): Session {
  return {
    id: input.id ?? newId(),
    userId: input.userId,
    tokenHash: input.tokenHash,
    expiresAt: input.expiresAt,
    createdAt: input.createdAt ?? nowTimestamp(),
  };
}

export function expiresAtFrom(issuedAt: Date, ttlSeconds: number = SESSION_TTL_SECONDS): string {
  return new Date(issuedAt.getTime() + ttlSeconds * 1000).toISOString();
}

export function isSessionExpired(session: Session, now: string = nowTimestamp()): boolean {
  return session.expiresAt <= now;
}
