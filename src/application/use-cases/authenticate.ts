import type { PasswordHasher } from '../ports/password-hasher';
import type { SessionRepository } from '../ports/session-repository';
import type { SessionTokens } from '../ports/session-tokens';
import type { UserRepository } from '../ports/user-repository';
import { emailKey } from '@/domain/account/email';
import { createSession, expiresAtFrom, SESSION_TTL_SECONDS } from '@/domain/account/session';
import { isVerified, type User } from '@/domain/account/user';
import { newId } from '@/domain/shared/id';
import { fail, ok, type Result } from '@/domain/shared/result';

export interface AuthenticateDeps {
  readonly users: UserRepository;
  readonly sessions: SessionRepository;
  readonly passwords: PasswordHasher;
  readonly tokens: SessionTokens;
}

export interface SignedIn {
  readonly user: User;
  /** JWT que vai para o cookie. O hash dele é o que ficou no banco. */
  readonly token: string;
  readonly maxAgeSeconds: number;
}

/**
 * Confere as credenciais e abre uma sessão.
 *
 * E-mail inexistente e senha errada devolvem a mesma mensagem: distinguir os
 * dois casos revelaria quais e-mails têm conta. E-mail não confirmado é o único
 * desvio com mensagem própria — o motorista precisa saber o que fazer.
 */
export async function authenticate(
  deps: AuthenticateDeps,
  input: { email: string; password: string },
): Promise<Result<SignedIn>> {
  const invalid = fail<SignedIn>('credenciais-invalidas', 'E-mail ou senha não conferem.', 'password');

  const user = await deps.users.findByEmail(emailKey(input.email));
  if (!user) return invalid;

  const matches = await deps.passwords.verify(input.password, user.passwordHash);
  if (!matches) return invalid;

  if (!isVerified(user)) {
    return fail(
      'email-nao-verificado',
      'Confirme seu e-mail antes de entrar. Confira a caixa de entrada e o spam.',
      'email',
    );
  }

  const sessionId = newId();
  const token = deps.tokens.issue({ userId: user.id, sessionId }, SESSION_TTL_SECONDS);

  await deps.sessions.save(
    createSession({
      id: sessionId,
      userId: user.id,
      tokenHash: deps.tokens.fingerprint(token),
      expiresAt: expiresAtFrom(new Date()),
    }),
  );

  return ok({ user, token, maxAgeSeconds: SESSION_TTL_SECONDS });
}
