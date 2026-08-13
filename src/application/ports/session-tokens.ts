/**
 * Porta de emissão e leitura do token de sessão (JWT).
 *
 * O token diz quem é o portador; o banco diz se a sessão ainda vale. Um token
 * assinado e dentro do prazo, mas sem linha em `sessions`, não entra.
 */

import type { Id } from '@/domain/shared/id';

export interface SessionClaims {
  readonly userId: Id;
  readonly sessionId: Id;
}

export interface SessionTokens {
  issue(claims: SessionClaims, ttlSeconds: number): string;
  /** `null` para assinatura inválida, formato quebrado ou prazo vencido. */
  verify(token: string): SessionClaims | null;
  /** SHA-256 do token — é o que a sessão guarda no banco. */
  fingerprint(token: string): string;
}
