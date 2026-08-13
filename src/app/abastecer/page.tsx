import { getVehicleSelection } from '@/application/use-cases/get-vehicle-selection';
import { today } from '@/domain/shared/iso-date';
import { getContainer } from '@/infrastructure/container';
import { EmptyState } from '@/ui/components/EmptyState';
import { PageHeader } from '@/ui/components/PageHeader';
import { ButtonLink } from '@/ui/components/PrimaryButton';
import { FillUpForm } from '@/ui/features/fill-ups/FillUpForm';
import styles from '../veiculos/form-page.module.css';

interface PageProps {
  searchParams: Promise<{ veiculo?: string }>;
}

export default async function RefuelPage({ searchParams }: PageProps) {
  const { veiculo } = await searchParams;
  const { vehicles, fillUps } = getContainer();

  const { vehicles: all, selected } = await getVehicleSelection(vehicles, veiculo);

  if (!selected) {
    return (
      <EmptyState
        title="Cadastre um veículo primeiro"
        description="O abastecimento precisa estar ligado a um veículo para virar média de consumo."
        action={<ButtonLink href="/veiculos/novo">Cadastrar veículo</ButtonLink>}
      />
    );
  }

  // O último odômetro de cada veículo alimenta o cálculo de distância ao digitar.
  const lastOdometers: Record<string, number> = {};
  await Promise.all(
    all.map(async (vehicle) => {
      const last = await fillUps.findLastByVehicle(vehicle.id);
      const odometer = last?.odometer ?? vehicle.initialOdometer;
      if (odometer > 0) lastOdometers[vehicle.id] = odometer;
    }),
  );

  const stationNames = await fillUps.listStationNames();

  return (
    <div className={styles.narrow}>
      <PageHeader
        title="Abastecimento"
        description="Anote o km do painel na hora de abastecer — é isso que dá a média."
      />
      <FillUpForm
        vehicles={all}
        selectedVehicleId={selected.id}
        lastOdometers={lastOdometers}
        stationNames={stationNames}
        today={today()}
      />
    </div>
  );
}
