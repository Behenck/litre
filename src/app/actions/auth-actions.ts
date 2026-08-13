'use server';

import { redirect } from 'next/navigation';
import { authenticate } from '@/application/use-cases/authenticate';
import { registerAccount } from '@/application/use-cases/register-account';
import { requestPasswordReset } from '@/application/use-cases/request-password-reset';
import { resendVerification } from '@/application/use-cases/resend-verification';
import { resetPassword } from '@/application/use-cases/reset-password';
import { sendVerification } from '@/application/use-cases/send-verification';
import { signOut } from '@/application/use-cases/sign-out';
import type { User } from '@/domain/account/user';
import { appUrl, getContainer } from '@/infrastructure/container';
import { type ActionState, errorState, toActionState } from './action-state';
import { text } from './form-parsing';

/** O link que chega no e-mail. A rota é decisão da UI, não do caso de uso. */
function verificationLink(token: string): string {
  return `${appUrl()}/verificar?token=${encodeURIComponent(token)}`;
}

function passwordResetLink(token: string): string {
  return `${appUrl()}/redefinir-senha?token=${encodeURIComponent(token)}`;
}

/**
 * Envia o e-mail sem deixar a falha derrubar o cadastro.
 *
 * O provedor de e-mail cai, recusa ou demora; a conta já está criada e o
 * motorista consegue pedir outro link. Devolve se saiu, para a tela dizer a
 * verdade sobre o que aconteceu.
 */
async function tryToSendVerification(user: User): Promise<boolean> {
  const { verifications, secrets, mailer } = getContainer();
  try {
    await sendVerification({ verifications, secrets, mailer, verificationLink }, user);
    return true;
  } catch (error) {
    console.error('Falha ao enviar o e-mail de confirmação:', error);
    return false;
  }
}

export async function signUpAction(_previous: ActionState, form: FormData): Promise<ActionState> {
  const { users, passwords } = getContainer();

  const result = await registerAccount(
    { users, passwords },
    {
      name: text(form, 'name'),
      email: text(form, 'email'),
      password: text(form, 'password'),
      city: text(form, 'city'),
      state: text(form, 'state'),
    },
  );

  if (!result.ok) return toActionState(result.error);

  const sent = await tryToSendVerification(result.value);
  const query = new URLSearchParams({ email: result.value.email, enviado: sent ? '1' : '0' });

  redirect(`/confirmar-email?${query.toString()}`);
}

export async function signInAction(_previous: ActionState, form: FormData): Promise<ActionState> {
  const { users, sessions, passwords, tokens, sessionCookie } = getContainer();

  const result = await authenticate(
    { users, sessions, passwords, tokens },
    { email: text(form, 'email'), password: text(form, 'password') },
  );

  if (!result.ok) {
    if (result.error.code === 'email-nao-verificado') {
      const query = new URLSearchParams({ email: text(form, 'email'), enviado: '1' });
      redirect(`/confirmar-email?${query.toString()}`);
    }
    return toActionState(result.error);
  }

  await sessionCookie.write(result.value.token, result.value.maxAgeSeconds);
  redirect('/');
}

export async function signOutAction(): Promise<void> {
  const { sessions, tokens, sessionCookie } = getContainer();

  await signOut({ sessions, tokens }, await sessionCookie.read());
  await sessionCookie.clear();

  redirect('/entrar');
}

export async function resendVerificationAction(_previous: ActionState, form: FormData): Promise<ActionState> {
  const { users, verifications, secrets, mailer } = getContainer();
  const email = text(form, 'email');

  try {
    await resendVerification({ users, verifications, secrets, mailer, verificationLink }, email);
  } catch (error) {
    console.error('Falha ao reenviar o e-mail de confirmação:', error);
    return errorState('Não conseguimos enviar o e-mail agora. Tente de novo em alguns minutos.');
  }

  return { status: 'success', message: 'E-mail reenviado. Confira a caixa de entrada e o spam.' };
}

const PASSWORD_RESET_REQUESTED = 'Se esse e-mail tiver conta, enviamos um link de redefinição. Confira a caixa de entrada e o spam.';

export async function requestPasswordResetAction(_previous: ActionState, form: FormData): Promise<ActionState> {
  const { users, passwordResets, secrets, mailer } = getContainer();

  try {
    await requestPasswordReset(
      { users, resets: passwordResets, secrets, mailer, resetLink: passwordResetLink },
      text(form, 'email'),
    );
  } catch (error) {
    console.error('Falha ao enviar o e-mail de redefinição de senha:', error);
    return errorState('Não conseguimos enviar o e-mail agora. Tente de novo em alguns minutos.');
  }

  return { status: 'success', message: PASSWORD_RESET_REQUESTED };
}

export async function resetPasswordAction(_previous: ActionState, form: FormData): Promise<ActionState> {
  const { users, passwordResets, passwords, secrets } = getContainer();

  const result = await resetPassword(
    { users, resets: passwordResets, passwords, secrets },
    { token: text(form, 'token'), password: text(form, 'password') },
  );

  if (!result.ok) return toActionState(result.error);

  const query = new URLSearchParams({ ok: 'Senha redefinida. Entre com a nova senha.' });
  redirect(`/entrar?${query.toString()}`);
}
