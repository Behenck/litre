import type { PasswordHasher } from '../ports/password-hasher';
import type { PasswordResetRepository } from '../ports/password-reset-repository';
import type { SecretTokens } from '../ports/secret-tokens';
import type { UserRepository } from '../ports/user-repository';
import { isPasswordResetExpired } from '@/domain/account/password-reset';
import { validatePassword } from '@/domain/account/password';
import { changePasswordHash, type User } from '@/domain/account/user';
import { fail, ok, type Result } from '@/domain/shared/result';

export interface ResetPasswordDeps {
  readonly users: UserRepository;
  readonly resets: PasswordResetRepository;
  readonly passwords: PasswordHasher;
  readonly secrets: SecretTokens;
}

/**
 * Troca a senha a partir do token do link.
 *
 * O token vale uma vez: usado (ou expirado), os convites do usuário são
 * descartados — reabrir o mesmo link depois cai em "link inválido".
 */
export async function resetPassword(
  deps: ResetPasswordDeps,
  input: { token: string; password: string },
): Promise<Result<User>> {
  const invalid = fail<User>('link-invalido', 'Esse link de redefinição não vale mais. Peça um novo.');
  if (input.token.trim() === '') return invalid;

  const reset = await deps.resets.findByTokenHash(deps.secrets.fingerprint(input.token));
  if (!reset) return invalid;

  if (isPasswordResetExpired(reset)) {
    await deps.resets.deleteByUser(reset.userId);
    return fail('link-invalido', 'Esse link expirou. Peça um novo e-mail de redefinição.');
  }

  const password = validatePassword(input.password);
  if (!password.ok) return password;

  const user = await deps.users.findById(reset.userId);
  if (!user) return invalid;

  const updated = changePasswordHash(user, await deps.passwords.hash(password.value));
  await deps.users.save(updated);
  await deps.resets.deleteByUser(user.id);

  return ok(updated);
}
