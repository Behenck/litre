import { getVehicleDashboard } from '@/application/use-cases/get-vehicle-dashboard';
import { getVehicleSelection } from '@/application/use-cases/get-vehicle-selection';
import { legForFillUp } from '@/domain/analytics/vehicle-stats';
import { vehicleDisplayName } from '@/domain/vehicle/vehicle';
import { getContainer } from '@/infrastructure/container';
import { EmptyState } from '@/ui/components/EmptyState';
import { PageHeader } from '@/ui/components/PageHeader';
import { ButtonLink } from '@/ui/components/PrimaryButton';
import { Toast } from '@/ui/components/Toast';
import { HistoryRow } from '@/ui/features/history/HistoryRow';
import { VehicleSwitcher } from '@/ui/features/shared/VehicleSwitcher';
import styles from './historico.module.css';

interface PageProps {
  searchParams: Promise<{ veiculo?: string; ok?: string }>;
}

export default async function HistoryPage({ searchParams }: PageProps) {
  const { veiculo, ok } = await searchParams;
  const { vehicles, fillUps, preferences } = getContainer();

  const [{ vehicles: all, selected }, { unit }] = await Promise.all([
    getVehicleSelection(vehicles, veiculo),
    preferences.read(),
  ]);

  if (!selected) {
    return (
      <EmptyState
        title="Nenhum veículo cadastrado"
        description="Cadastre um veículo para começar a registrar abastecimentos."
        action={<ButtonLink href="/veiculos/novo">Cadastrar veículo</ButtonLink>}
      />
    );
  }

  // `all` já vem do mais recente para o mais antigo (FR-012).
  const { stats, all: history } = await getVehicleDashboard(fillUps, selected.id);

  return (
    <>
      <PageHeader
        title="Histórico"
        description={`${vehicleDisplayName(selected)} · ${stats.fillUpCount} abastecimento(s)`}
        action={<VehicleSwitcher vehicles={all} selectedId={selected.id} basePath="/historico" />}
      />

      {history.length === 0 ? (
        <EmptyState
          title="Nenhum abastecimento registrado ainda"
          description="Registre o primeiro abastecimento para começar a acompanhar o consumo."
          action={<ButtonLink href={`/abastecer?veiculo=${selected.id}`}>Registrar abastecimento</ButtonLink>}
        />
      ) : (
        <ul className={styles.list}>
          {history.map((fillUp) => (
            <HistoryRow
              key={fillUp.id}
              fillUp={fillUp}
              leg={legForFillUp(stats.legs, fillUp.id)}
              unit={unit}
              vehicleId={selected.id}
            />
          ))}
        </ul>
      )}

      {ok ? <Toast message={ok} /> : null}
    </>
  );
}
