import type { Mailer } from '../ports/mailer';
import type { PasswordResetRepository } from '../ports/password-reset-repository';
import type { SecretTokens } from '../ports/secret-tokens';
import type { UserRepository } from '../ports/user-repository';
import { createPasswordReset } from '@/domain/account/password-reset';
import { emailKey } from '@/domain/account/email';

export interface RequestPasswordResetDeps {
  readonly users: UserRepository;
  readonly resets: PasswordResetRepository;
  readonly secrets: SecretTokens;
  readonly mailer: Mailer;
  /** Monta o link de redefinição a partir do token — a rota é detalhe da UI. */
  readonly resetLink: (token: string) => string;
}

/**
 * Emite um convite de redefinição de senha e o envia por e-mail.
 *
 * Não devolve `Result`: a resposta é sempre a mesma, exista ou não a conta.
 * Dizer "esse e-mail não está cadastrado" entregaria a estranhos quem tem
 * conta aqui — mesmo raciocínio de `resendVerification`.
 *
 * Pedir um link novo aposenta o anterior, como na confirmação de e-mail.
 */
export async function requestPasswordReset(deps: RequestPasswordResetDeps, email: string): Promise<void> {
  const user = await deps.users.findByEmail(emailKey(email));
  if (!user) return;

  const secret = deps.secrets.create();

  await deps.resets.deleteByUser(user.id);
  await deps.resets.save(createPasswordReset({ tokenHash: deps.secrets.fingerprint(secret), userId: user.id }));

  await deps.mailer.sendPasswordReset({
    to: user.email,
    name: user.name,
    link: deps.resetLink(secret),
  });
}
