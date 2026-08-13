import type { VerificationMessage } from '@/application/ports/mailer';

/**
 * Texto do e-mail de confirmação.
 *
 * HTML simples e inline: cliente de e-mail ignora folha de estilo externa, e
 * muita gente lê no celular. Vai junto a versão em texto puro, para quem
 * bloqueia HTML continuar conseguindo confirmar.
 */

export interface EmailBody {
  readonly subject: string;
  readonly html: string;
  readonly text: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function verificationEmail(message: VerificationMessage): EmailBody {
  const name = escapeHtml(message.name.split(' ')[0] ?? '');
  const link = escapeHtml(message.link);

  const html = `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;padding:24px;background:#f3f3f1;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#14161a">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e5e5e0;border-radius:14px;padding:28px">
      <p style="margin:0 0 4px;font-size:13px;color:#0e8f6e;font-weight:600;letter-spacing:0.08em">LITRO</p>
      <h1 style="margin:0 0 16px;font-size:22px">Confirme seu e-mail, ${name}</h1>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#41454b">
        Falta um passo para começar a controlar seus abastecimentos e ver os preços dos postos da sua cidade.
      </p>
      <a href="${link}" style="display:inline-block;background:#0e8f6e;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 24px;border-radius:14px">
        Confirmar meu e-mail
      </a>
      <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#71757c">
        O link vale por 24 horas. Se o botão não funcionar, copie e cole este endereço no navegador:<br />
        <span style="word-break:break-all;color:#41454b">${link}</span>
      </p>
      <p style="margin:20px 0 0;font-size:13px;color:#71757c">
        Não foi você quem criou a conta? É só ignorar este e-mail.
      </p>
    </div>
  </body>
</html>`;

  const text = [
    `Confirme seu e-mail, ${message.name.split(' ')[0] ?? ''}`,
    '',
    'Falta um passo para começar a usar o Litro. Abra o link abaixo para confirmar seu e-mail:',
    message.link,
    '',
    'O link vale por 24 horas. Não foi você quem criou a conta? É só ignorar este e-mail.',
  ].join('\n');

  return { subject: 'Confirme seu e-mail no Litro', html, text };
}
