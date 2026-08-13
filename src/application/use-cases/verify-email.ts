import type { EmailVerificationRepository } from '../ports/email-verification-repository';
import type { SecretTokens } from '../ports/secret-tokens';
import type { UserRepository } from '../ports/user-repository';
import { isVerificationExpired } from '@/domain/account/email-verification';
import { isVerified, markVerified, type User } from '@/domain/account/user';
import { fail, ok, type Result } from '@/domain/shared/result';

export interface VerifyEmailDeps {
  readonly users: UserRepository;
  readonly verifications: EmailVerificationRepository;
  readonly secrets: SecretTokens;
}

/**
 * Confirma o e-mail a partir do token do link.
 *
 * O token vale uma vez: confirmado, os convites do usuário são descartados.
 * Reabrir o mesmo link depois cai em "link inválido" — por isso quem já está
 * verificado passa direto, sem erro, se o convite ainda existir.
 */
export async function verifyEmail(deps: VerifyEmailDeps, token: string): Promise<Result<User>> {
  const invalid = fail<User>('link-invalido', 'Esse link de confirmação não vale mais. Peça um novo.');
  if (token.trim() === '') return invalid;

  const verification = await deps.verifications.findByTokenHash(deps.secrets.fingerprint(token));
  if (!verification) return invalid;

  if (isVerificationExpired(verification)) {
    await deps.verifications.deleteByUser(verification.userId);
    return fail('link-invalido', 'Esse link expirou. Peça um novo e-mail de confirmação.');
  }

  const user = await deps.users.findById(verification.userId);
  if (!user) return invalid;

  await deps.verifications.deleteByUser(user.id);
  if (isVerified(user)) return ok(user);

  const verified = markVerified(user);
  await deps.users.save(verified);

  return ok(verified);
}
