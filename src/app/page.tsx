import { requireUser } from '@/app/auth/current-user';
import { listVehicles } from '@/application/use-cases/list-vehicles';
import { getContainer } from '@/infrastructure/container';
import { ButtonLink } from '@/ui/components/PrimaryButton';
import { PageHeader } from '@/ui/components/PageHeader';
import { Toast } from '@/ui/components/Toast';
import { EmptyState } from '@/ui/components/EmptyState';
import { VehicleGrid } from '@/ui/features/vehicles/VehicleGrid';

interface PageProps {
  searchParams: Promise<{ ok?: string }>;
}

/** Server Component: lê os dados na renderização, sem fetch no cliente. */
export default async function VehiclesPage({ searchParams }: PageProps) {
  const { ok } = await searchParams;
  const { vehicles, fillUps, preferences } = getContainer();
  const user = await requireUser();

  const [summaries, { unit }] = await Promise.all([listVehicles(vehicles, fillUps, user.id), preferences.read()]);

  return (
    <>
      <PageHeader
        title="Meus veículos"
        description="Toque em um veículo para ver a média e registrar abastecimentos."
        action={<ButtonLink href="/veiculos/novo">+ Novo veículo</ButtonLink>}
      />

      {summaries.length === 0 ? (
        <EmptyState
          title="Nenhum veículo cadastrado ainda"
          description="Cadastre seu primeiro veículo para começar a registrar abastecimentos e descobrir a média real de consumo."
          action={<ButtonLink href="/veiculos/novo">Cadastrar veículo</ButtonLink>}
        />
      ) : (
        <VehicleGrid summaries={summaries} unit={unit} />
      )}

      {ok ? <Toast message={ok} /> : null}
    </>
  );
}
