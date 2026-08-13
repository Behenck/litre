import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthShell } from '@/ui/features/account/AuthShell';
import { ResendVerificationForm } from '@/ui/features/account/ResendVerificationForm';

export const metadata: Metadata = { title: 'Confirme seu e-mail — Litre' };

interface PageProps {
  searchParams: Promise<{ email?: string; enviado?: string }>;
}

/**
 * Parada entre criar a conta e entrar.
 *
 * Quando o envio falhou (`enviado=0`) a tela diz isso na cara: melhor admitir e
 * oferecer o reenvio do que deixar o motorista esperando um e-mail que não saiu.
 */
export default async function ConfirmEmailPage({ searchParams }: PageProps) {
  const { email = '', enviado } = await searchParams;
  const failed = enviado === '0';

  return (
    <AuthShell
      title={failed ? 'Conta criada, mas o e-mail não saiu' : 'Confirme seu e-mail'}
      description={
        failed
          ? `Sua conta foi criada, mas não conseguimos enviar o link de confirmação${email ? ` para ${email}` : ''}. Tente enviar de novo.`
          : `Enviamos um link de confirmação${email ? ` para ${email}` : ''}. Abra o e-mail e toque no botão para liberar seu acesso.`
      }
      footer={
        <>
          Já confirmou? <Link href="/entrar">Entrar</Link>
        </>
      }
    >
      <ResendVerificationForm email={email} />
    </AuthShell>
  );
}
