import { requireUser } from '@/app/auth/current-user';
import { getVehicleDashboard } from '@/application/use-cases/get-vehicle-dashboard';
import { getVehicleSelection } from '@/application/use-cases/get-vehicle-selection';
import { getContainer } from '@/infrastructure/container';
import { unitLabel } from '@/domain/shared/consumption-unit';
import { Card } from '@/ui/components/Card';
import { EmptyState } from '@/ui/components/EmptyState';
import { ButtonLink } from '@/ui/components/PrimaryButton';
import { Toast } from '@/ui/components/Toast';
import { AverageCard } from '@/ui/features/dashboard/AverageCard';
import { ConsumptionChart } from '@/ui/features/dashboard/ConsumptionChart';
import { RecentFillUps } from '@/ui/features/dashboard/RecentFillUps';
import { StatCard } from '@/ui/features/dashboard/StatCard';
import { VehicleHeading } from '@/ui/features/dashboard/VehicleHeading';
import { VehicleSwitcher } from '@/ui/features/shared/VehicleSwitcher';
import { DeleteVehicleButton } from '@/ui/features/vehicles/DeleteVehicleButton';
import { vehicleDisplayName } from '@/domain/vehicle/vehicle';
import { formatMoney } from '@/ui/format/currency';
import { formatLiters } from '@/ui/format/number';
import styles from './painel.module.css';

interface PageProps {
  searchParams: Promise<{ veiculo?: string; ok?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const { veiculo, ok } = await searchParams;
  const { vehicles, fillUps, preferences } = getContainer();
  const user = await requireUser();

  const [{ vehicles: all, selected }, { unit }] = await Promise.all([
    getVehicleSelection(vehicles, user.id, veiculo),
    preferences.read(),
  ]);

  if (!selected) {
    return (
      <EmptyState
        title="Nenhum veículo cadastrado"
        description="Cadastre um veículo para acompanhar a média de consumo e o custo por quilômetro."
        action={<ButtonLink href="/veiculos/novo">Cadastrar veículo</ButtonLink>}
      />
    );
  }

  const { stats, recent } = await getVehicleDashboard(fillUps, user.id, selected.id);

  return (
    <>
      <div className={styles.top}>
        <VehicleHeading vehicle={selected} />
        <div className={styles.vehicleActions}>
          <VehicleSwitcher vehicles={all} selectedId={selected.id} basePath="/painel" />
          <ButtonLink href={`/veiculos/${selected.id}/editar`} variant="ghost">
            Editar veículo
          </ButtonLink>
          <DeleteVehicleButton
            vehicleId={selected.id}
            vehicleName={vehicleDisplayName(selected)}
            fillUpCount={stats.fillUpCount}
          />
        </div>
      </div>

      <div className={styles.stats}>
        <AverageCard averageKmPerLiter={stats.averageKmPerLiter} unit={unit} trend={stats.trend} />
        <StatCard
          label="Custo por km"
          value={stats.costPerKm > 0 ? formatMoney(stats.costPerKm) : '—'}
          hint={stats.lastPricePerLiter > 0 ? `Último preço: ${formatMoney(stats.lastPricePerLiter)}/L` : undefined}
        />
        <StatCard
          label="Total gasto"
          value={formatMoney(stats.totalSpent)}
          hint={`${stats.fillUpCount} abastecimento(s) · ${formatLiters(stats.totalLiters)} L`}
        />
      </div>

      <div className={styles.panels}>
        <Card>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Consumo por abastecimento</h2>
            <span className={styles.cardMeta}>{unitLabel(unit)}</span>
          </div>
          <ConsumptionChart legs={stats.legs} unit={unit} />
        </Card>

        <Card>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Últimos abastecimentos</h2>
          </div>
          <RecentFillUps fillUps={recent} vehicleId={selected.id} />
          <div className={styles.cardAction}>
            <ButtonLink href={`/abastecer?veiculo=${selected.id}`} full>
              Registrar abastecimento
            </ButtonLink>
          </div>
        </Card>
      </div>

      {ok ? <Toast message={ok} /> : null}
    </>
  );
}
