import Link from 'next/link';
import type { ConsumptionUnit } from '@/domain/shared/consumption-unit';
import { unitLabel } from '@/domain/shared/consumption-unit';
import type { VehicleSummary } from '@/application/use-cases/list-vehicles';
import { formatPlate } from '@/domain/vehicle/plate';
import { fuelLabel } from '@/domain/vehicle/fuel-type';
import { vehicleDisplayName, VEHICLE_TYPES } from '@/domain/vehicle/vehicle';
import { formatConsumption, formatKm } from '@/ui/format/number';
import styles from './VehicleCard.module.css';

interface VehicleCardProps {
  summary: VehicleSummary;
  unit: ConsumptionUnit;
}

export function VehicleCard({ summary, unit }: VehicleCardProps) {
  const { vehicle, averageKmPerLiter, currentOdometer } = summary;
  const typeLabel = VEHICLE_TYPES.find((type) => type.value === vehicle.type)?.label ?? vehicle.type;
  const subtitle = [vehicle.year, fuelLabel(vehicle.mainFuel)].filter(Boolean).join(' · ');
  const name = vehicleDisplayName(vehicle);

  return (
    <Link href={`/painel?veiculo=${vehicle.id}`} className={styles.card}>
      <span className={styles.halo} style={{ background: vehicle.color }} aria-hidden="true" />

      <span className={styles.top}>
        <span className={styles.swatch} style={{ background: vehicle.color }} aria-hidden="true" />
        <span className={styles.type}>{typeLabel}</span>
      </span>

      <span className={styles.title}>{name}</span>
      {subtitle ? <span className={styles.subtitle}>{subtitle}</span> : null}
      <span className={styles.plate}>{vehicle.plate ? formatPlate(vehicle.plate) : 'SEM PLACA'}</span>

      <span className={styles.stats}>
        <span>
          <span className={styles.statLabel}>Média</span>
          <span className={styles.average}>
            {averageKmPerLiter > 0 ? `${formatConsumption(averageKmPerLiter, unit)} ${unitLabel(unit)}` : '—'}
          </span>
        </span>
        <span className={styles.odometer}>
          <span className={styles.statLabel}>Odômetro</span>
          <span className={styles.odometerValue}>{formatKm(currentOdometer)}</span>
        </span>
      </span>
    </Link>
  );
}
