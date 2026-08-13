import type { VehicleSummary } from '@/application/use-cases/list-vehicles';
import type { ConsumptionUnit } from '@/domain/shared/consumption-unit';
import { AddVehicleCard } from './AddVehicleCard';
import { VehicleCard } from './VehicleCard';
import styles from './VehicleGrid.module.css';

interface VehicleGridProps {
  summaries: readonly VehicleSummary[];
  unit: ConsumptionUnit;
}

export function VehicleGrid({ summaries, unit }: VehicleGridProps) {
  return (
    <div className={styles.grid}>
      {summaries.map((summary) => (
        <VehicleCard key={summary.vehicle.id} summary={summary} unit={unit} />
      ))}
      <AddVehicleCard />
    </div>
  );
}
