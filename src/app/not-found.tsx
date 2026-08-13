import { ButtonLink } from '@/ui/components/PrimaryButton';
import { EmptyState } from '@/ui/components/EmptyState';

export default function NotFound() {
  return (
    <EmptyState
      title="Página não encontrada"
      description="O endereço acessado não existe ou o veículo foi removido."
      action={<ButtonLink href="/">Ir para meus veículos</ButtonLink>}
    />
  );
}
