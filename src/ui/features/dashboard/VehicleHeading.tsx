import { fuelLabel } from '@/domain/vehicle/fuel-type';
import { formatPlate } from '@/domain/vehicle/plate';
import { type Vehicle, vehicleDisplayName } from '@/domain/vehicle/vehicle';
import styles from './VehicleHeading.module.css';

interface VehicleHeadingProps {
  vehicle: Vehicle;
}

/** Cabeçalho do painel: cor, nome, placa e combustível do veículo em foco. */
export function VehicleHeading({ vehicle }: VehicleHeadingProps) {
  return (
    <div className={styles.heading}>
      <span className={styles.swatch} style={{ background: vehicle.color }} aria-hidden="true" />
      <div className={styles.text}>
        <h1 className={styles.title}>{vehicleDisplayName(vehicle)}</h1>
        <p className={styles.meta}>
          {vehicle.plate ? formatPlate(vehicle.plate) : 'Sem placa'} · {fuelLabel(vehicle.mainFuel)}
        </p>
      </div>
    </div>
  );
}
