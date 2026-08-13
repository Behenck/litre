import 'server-only';

import type { Mailer, PasswordResetMessage, VerificationMessage } from '@/application/ports/mailer';
import { passwordResetEmail } from './password-reset-email';
import { type EmailBody, verificationEmail } from './verification-email';

/**
 * Envio pelo Resend, via HTTP direto.
 *
 * A API de e-mail é um POST com JSON; um SDK aqui só acrescentaria peso ao
 * servidor (Princípio V). A chave nunca sai do processo do servidor.
 */

const ENDPOINT = 'https://api.resend.com/emails';
/** Remetente de teste do Resend: entrega só para o dono da conta até verificar um domínio. */
const DEFAULT_FROM = 'Litre <onboarding@resend.dev>';

/** Falha de envio é de infraestrutura, como `RepositoryError` — a UI traduz para o motorista. */
export class MailError extends Error {
  constructor(
    message: string,
    override readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'MailError';
  }
}

export class ResendMailer implements Mailer {
  async sendVerification(message: VerificationMessage): Promise<void> {
    await this.send(message.to, verificationEmail(message));
  }

  async sendPasswordReset(message: PasswordResetMessage): Promise<void> {
    await this.send(message.to, passwordResetEmail(message));
  }

  private async send(to: string, body: EmailBody): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new MailError('Configure RESEND_API_KEY para enviar o e-mail.');
    }

    let response: Response;
    try {
      response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: process.env.LITRO_MAIL_FROM ?? DEFAULT_FROM,
          to: [to],
          subject: body.subject,
          html: body.html,
          text: body.text,
        }),
      });
    } catch (cause) {
      throw new MailError('Não foi possível falar com o serviço de e-mail.', cause);
    }

    if (!response.ok) {
      throw new MailError(`O serviço de e-mail recusou o envio (${response.status}): ${await response.text()}`);
    }
  }
}
