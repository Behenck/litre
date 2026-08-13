'use client';

import { PrimaryButton } from '@/ui/components/PrimaryButton';
import { EmptyState } from '@/ui/components/EmptyState';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Fronteira de erro.
 *
 * A mensagem técnica não é mostrada ao motorista; o botão tenta renderizar a
 * rota de novo sem recarregar a página inteira.
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  console.error(error);

  return (
    <EmptyState
      title="Algo deu errado ao carregar esta tela"
      description="Nenhum dado foi perdido. Tente de novo — se continuar, feche e abra o app."
      action={<PrimaryButton onClick={reset}>Tentar de novo</PrimaryButton>}
    />
  );
}
