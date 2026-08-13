import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthShell } from '@/ui/features/account/AuthShell';
import { ForgotPasswordForm } from '@/ui/features/account/ForgotPasswordForm';

export const metadata: Metadata = { title: 'Esqueci minha senha — Litre' };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Esqueci minha senha"
      description="Informe o e-mail da sua conta. Se ele tiver cadastro, enviamos um link para escolher uma senha nova."
      footer={
        <>
          Lembrou a senha? <Link href="/entrar">Entrar</Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
