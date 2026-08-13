import type { SessionRepository } from '../ports/session-repository';
import type { SessionTokens } from '../ports/session-tokens';

export interface SignOutDeps {
  readonly sessions: SessionRepository;
  readonly tokens: SessionTokens;
}

/**
 * Encerra a sessão do token apresentado.
 *
 * A linha some do banco, então o mesmo JWT não entra de novo nem dentro da
 * validade. Token ilegível é ignorado em silêncio: sair nunca falha.
 */
export async function signOut(deps: SignOutDeps, token: string | null): Promise<void> {
  if (!token) return;

  const claims = deps.tokens.verify(token);
  if (!claims) return;

  await deps.sessions.delete(claims.sessionId);
}
