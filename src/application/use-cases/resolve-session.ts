import type { SessionRepository } from '../ports/session-repository';
import type { SessionTokens } from '../ports/session-tokens';
import type { UserRepository } from '../ports/user-repository';
import { isSessionExpired } from '@/domain/account/session';
import { isVerified, type User } from '@/domain/account/user';

export interface ResolveSessionDeps {
  readonly users: UserRepository;
  readonly sessions: SessionRepository;
  readonly tokens: SessionTokens;
}

/**
 * Diz quem é o dono do token — ou `null`.
 *
 * Três perguntas, todas obrigatórias: a assinatura confere, a sessão ainda
 * existe no banco (é isso que faz "sair" ter efeito imediato) e o token
 * apresentado é o mesmo daquela sessão. Sessão vencida é apagada na passagem,
 * para o banco não virar depósito de sessão morta.
 */
export async function resolveSession(deps: ResolveSessionDeps, token: string | null): Promise<User | null> {
  if (!token) return null;

  const claims = deps.tokens.verify(token);
  if (!claims) return null;

  const session = await deps.sessions.findById(claims.sessionId);
  if (!session || session.userId !== claims.userId) return null;

  if (session.tokenHash !== deps.tokens.fingerprint(token)) return null;

  if (isSessionExpired(session)) {
    await deps.sessions.delete(session.id);
    return null;
  }

  const user = await deps.users.findById(session.userId);
  if (!user || !isVerified(user)) return null;

  return user;
}
