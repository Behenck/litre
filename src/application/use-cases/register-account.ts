import type { PasswordHasher } from '../ports/password-hasher';
import type { UserRepository } from '../ports/user-repository';
import { emailKey } from '@/domain/account/email';
import { validatePassword } from '@/domain/account/password';
import { createUser, type User } from '@/domain/account/user';
import { fail, ok, type Result } from '@/domain/shared/result';

export interface RegisterAccountDeps {
  readonly users: UserRepository;
  readonly passwords: PasswordHasher;
}

export interface RegisterAccountInput {
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly city: string;
  readonly state: string;
}

/**
 * Cria a conta.
 *
 * A conta nasce sem verificação: só depois de confirmar o e-mail o motorista
 * consegue entrar. A senha é validada em texto puro, virada em hash aqui, e o
 * texto puro não sai desta função.
 *
 * O envio do e-mail é passo separado (`sendVerification`) de propósito: falha
 * de e-mail não pode desfazer um cadastro que já deu certo — o motorista pede
 * outro link e entra.
 */
export async function registerAccount(deps: RegisterAccountDeps, input: RegisterAccountInput): Promise<Result<User>> {
  const password = validatePassword(input.password);
  if (!password.ok) return password;

  const existing = await deps.users.findByEmail(emailKey(input.email));
  if (existing) {
    return fail('email-em-uso', 'Já existe uma conta com esse e-mail. Tente entrar.', 'email');
  }

  const passwordHash = await deps.passwords.hash(password.value);
  const created = createUser({
    name: input.name,
    email: input.email,
    passwordHash,
    city: input.city,
    state: input.state,
  });
  if (!created.ok) return created;

  await deps.users.save(created.value);
  return ok(created.value);
}
