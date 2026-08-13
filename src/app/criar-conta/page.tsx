import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/app/auth/current-user';
import { AuthShell } from '@/ui/features/account/AuthShell';
import { SignUpForm } from '@/ui/features/account/SignUpForm';

export const metadata: Metadata = { title: 'Criar conta — Litre' };

export default async function SignUpPage() {
  if (await currentUser()) redirect('/');

  return (
    <AuthShell
      title="Criar conta"
      description="Leva um minuto. Depois é só confirmar o e-mail e começar a anotar."
      footer={
        <>
          Já tem conta? <Link href="/entrar">Entrar</Link>
        </>
      }
    >
      <SignUpForm />
    </AuthShell>
  );
}
