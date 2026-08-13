import { requireUser } from '@/app/auth/current-user';
import { getVehicleSelection } from '@/application/use-cases/get-vehicle-selection';
import { listStations } from '@/application/use-cases/list-stations';
import { averageKmPerLiter } from '@/domain/analytics/consumption';
import { vehicleDisplayName } from '@/domain/vehicle/vehicle';
import { getContainer } from '@/infrastructure/container';
import { PageHeader } from '@/ui/components/PageHeader';
import { FuelComparator } from '@/ui/features/comparison/FuelComparator';
import { VehicleSwitcher } from '@/ui/features/shared/VehicleSwitcher';
import { moneyToInputValue } from '@/ui/format/currency';
import styles from './comparativo.module.css';

interface PageProps {
  searchParams: Promise<{ veiculo?: string }>;
}

export default async function ComparisonPage({ searchParams }: PageProps) {
  const { veiculo } = await searchParams;
  const { vehicles, fillUps, stations } = getContainer();
  const user = await requireUser();

  const [{ vehicles: all, selected }, { stations: allStations, cheapestId }] = await Promise.all([
    getVehicleSelection(vehicles, user.id, veiculo),
    listStations(stations, user.regionKey),
  ]);

  // Parte dos preços do posto mais barato já anotado, quando existe.
  const reference = allStations.find((station) => station.id === cheapestId) ?? allStations[0];

  const average = selected ? averageKmPerLiter(await fillUps.listByVehicle(user.id, selected.id)) : 0;

  return (
    <div className={styles.narrow}>
      <PageHeader
        title="Etanol ou gasolina?"
        description="Compara pelo consumo real do seu veículo — não só pela regra dos 70%."
        action={selected ? <VehicleSwitcher vehicles={all} selectedId={selected.id} basePath="/comparativo" /> : null}
      />

      <FuelComparator
        gasolineKmPerLiter={average > 0 ? average : null}
        vehicleName={selected ? vehicleDisplayName(selected) : 'seu veículo'}
        defaultGasolinePrice={moneyToInputValue(reference?.gasolinePrice ?? null)}
        defaultEthanolPrice={moneyToInputValue(reference?.ethanolPrice ?? null)}
      />
    </div>
  );
}
