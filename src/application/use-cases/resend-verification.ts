import type { UserRepository } from '../ports/user-repository';
import { sendVerification, type SendVerificationDeps } from './send-verification';
import { emailKey } from '@/domain/account/email';
import { isVerified } from '@/domain/account/user';

export interface ResendVerificationDeps extends SendVerificationDeps {
  readonly users: UserRepository;
}

/**
 * Reenvia o e-mail de confirmação.
 *
 * Não devolve `Result`: a resposta é sempre a mesma, exista ou não a conta.
 * Dizer "esse e-mail não está cadastrado" entregaria a estranhos quem tem conta
 * aqui.
 */
export async function resendVerification(deps: ResendVerificationDeps, email: string): Promise<void> {
  const user = await deps.users.findByEmail(emailKey(email));
  if (!user || isVerified(user)) return;

  await sendVerification(deps, user);
}
