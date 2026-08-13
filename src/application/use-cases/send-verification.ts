import type { EmailVerificationRepository } from '../ports/email-verification-repository';
import type { Mailer } from '../ports/mailer';
import type { SecretTokens } from '../ports/secret-tokens';
import { createEmailVerification } from '@/domain/account/email-verification';
import type { User } from '@/domain/account/user';

export interface SendVerificationDeps {
  readonly verifications: EmailVerificationRepository;
  readonly secrets: SecretTokens;
  readonly mailer: Mailer;
  /** Monta o link de confirmação a partir do token — a rota é detalhe da UI. */
  readonly verificationLink: (token: string) => string;
}

/**
 * Emite um convite de confirmação e o envia por e-mail.
 *
 * Emitir invalida os convites anteriores: pedir um link novo aposenta o antigo,
 * então um e-mail velho esquecido na caixa de entrada não confirma mais nada.
 */
export async function sendVerification(deps: SendVerificationDeps, user: User): Promise<void> {
  const secret = deps.secrets.create();

  await deps.verifications.deleteByUser(user.id);
  await deps.verifications.save(
    createEmailVerification({ tokenHash: deps.secrets.fingerprint(secret), userId: user.id }),
  );

  await deps.mailer.sendVerification({
    to: user.email,
    name: user.name,
    link: deps.verificationLink(secret),
  });
}
