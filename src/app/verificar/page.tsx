import type { Metadata } from 'next';
import Link from 'next/link';
import { verifyEmail } from '@/application/use-cases/verify-email';
import { getContainer } from '@/infrastructure/container';
import { ButtonLink } from '@/ui/components/PrimaryButton';
import { AuthShell } from '@/ui/features/account/AuthShell';

export const metadata: Metadata = { title: 'Confirmação de e-mail — Litre' };

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

/**
 * Fim do link que chegou por e-mail.
 *
 * A confirmação acontece na renderização, e não numa action, porque o motorista
 * chega aqui por um clique no e-mail — não há formulário para enviar.
 */
export default async function VerifyPage({ searchParams }: PageProps) {
  const { token = '' } = await searchParams;
  const { users, verifications, secrets } = getContainer();

  const result = await verifyEmail({ users, verifications, secrets }, token);

  if (!result.ok) {
    return (
      <AuthShell
        title="Link inválido"
        description={result.error.message}
        footer={
          <>
            Precisa de outro link? <Link href="/confirmar-email">Reenviar confirmação</Link>
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
      title="E-mail confirmado"
      description={`Tudo certo, ${result.value.name.split(' ')[0]}. Sua conta está liberada — é só entrar.`}
    >
      <ButtonLink href="/entrar" full>
        Entrar no Litre
      </ButtonLink>
    </AuthShell>
  );
}
