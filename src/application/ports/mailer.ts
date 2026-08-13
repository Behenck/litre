/**
 * Porta de envio de e-mail.
 *
 * A aplicação decide *quando* confirmar um e-mail e para onde o link aponta;
 * o assunto, o texto e o provedor (Resend) são detalhe do adaptador.
 */
export interface VerificationMessage {
  readonly to: string;
  readonly name: string;
  readonly link: string;
}

export interface Mailer {
  sendVerification(message: VerificationMessage): Promise<void>;
}
