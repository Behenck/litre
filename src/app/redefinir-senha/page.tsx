import type { Metadata } from 'next';
import Link from 'next/link';
import { ButtonLink } from '@/ui/components/PrimaryButton';
import { AuthShell } from '@/ui/features/account/AuthShell';
import { ResetPasswordForm } from '@/ui/features/account/ResetPasswordForm';

export const metadata: Metadata = { title: 'Redefinir senha — Litre' };

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const { token = '' } = await searchParams;

  if (token === '') {
    return (
      <AuthShell
        title="Link inválido"
        description="Esse link de redefinição não vale mais. Peça um novo."
        footer={
          <>
            Precisa de outro link? <Link href="/esqueci-senha">Esqueci minha senha</Link>
          </>
        }
      >
        <ButtonLink href="/entrar" variant="ghost" full>
          Ir para o login
        </ButtonLink>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Redefinir senha"
      description="Escolha uma senha nova para a sua conta."
      footer={
        <>
          Link expirado? <Link href="/esqueci-senha">Peça outro</Link>
        </>
      }
    >
      <ResetPasswordForm token={token} />
    </AuthShell>
  );
}
