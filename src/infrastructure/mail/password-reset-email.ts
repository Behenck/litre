import type { PasswordResetMessage } from '@/application/ports/mailer';
import type { EmailBody } from './verification-email';

/**
 * Texto do e-mail de redefinição de senha.
 *
 * Mesmo estilo do e-mail de confirmação: HTML inline com versão em texto puro.
 */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function passwordResetEmail(message: PasswordResetMessage): EmailBody {
  const name = escapeHtml(message.name.split(' ')[0] ?? '');
  const link = escapeHtml(message.link);

  const html = `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;padding:24px;background:#f3f3f1;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#14161a">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e5e5e0;border-radius:14px;padding:28px">
      <p style="margin:0 0 4px;font-size:13px;color:#0e8f6e;font-weight:600;letter-spacing:0.08em">LITRE</p>
      <h1 style="margin:0 0 16px;font-size:22px">Redefinir sua senha, ${name}</h1>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#41454b">
        Recebemos um pedido para trocar a senha da sua conta. Toque no botão abaixo para escolher uma nova.
      </p>
      <a href="${link}" style="display:inline-block;background:#0e8f6e;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 24px;border-radius:14px">
        Redefinir minha senha
      </a>
      <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#71757c">
        O link vale por 1 hora. Se o botão não funcionar, copie e cole este endereço no navegador:<br />
        <span style="word-break:break-all;color:#41454b">${link}</span>
      </p>
      <p style="margin:20px 0 0;font-size:13px;color:#71757c">
        Não foi você quem pediu? É só ignorar este e-mail — sua senha continua a mesma.
      </p>
    </div>
  </body>
</html>`;

  const text = [
    `Redefinir sua senha, ${message.name.split(' ')[0] ?? ''}`,
    '',
    'Recebemos um pedido para trocar a senha da sua conta. Abra o link abaixo para escolher uma nova:',
    message.link,
    '',
    'O link vale por 1 hora. Não foi você quem pediu? É só ignorar este e-mail — sua senha continua a mesma.',
  ].join('\n');

  return { subject: 'Redefinir sua senha no Litre', html, text };
}
