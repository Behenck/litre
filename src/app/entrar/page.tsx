import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/app/auth/current-user';
import { Toast } from '@/ui/components/Toast';
import { AuthShell } from '@/ui/features/account/AuthShell';
import { SignInForm } from '@/ui/features/account/SignInForm';

export const metadata: Metadata = { title: 'Entrar — Litre' };

interface PageProps {
  searchParams: Promise<{ ok?: string }>;
}

export default async function SignInPage({ searchParams }: PageProps) {
  const { ok } = await searchParams;

  // Quem já está logado não tem o que fazer aqui.
  if (await currentUser()) redirect('/');

  return (
    <>
      <AuthShell
        title="Entrar"
        description="Seus veículos, seu histórico e os preços dos postos da sua cidade."
        footer={
          <>
            Ainda não tem conta? <Link href="/criar-conta">Criar conta</Link>
          </>
        }
      >
        <SignInForm />
      </AuthShell>

      {ok ? <Toast message={ok} /> : null}
    </>
  );
}
