import type { Vehicle } from '@/domain/vehicle/vehicle';
import { vehicleDisplayName } from '@/domain/vehicle/vehicle';
import { OptionPill } from '@/ui/components/OptionPill';
import styles from './VehiclePicker.module.css';

interface VehiclePickerProps {
  vehicles: readonly Vehicle[];
  selectedId: string;
  /** Quando o formulário precisa reagir à troca (recalcular a distância). */
  onSelect?: (id: string) => void;
}

/** Seleção do veículo dentro de um formulário — vai junto no envio. */
export function VehiclePicker({ vehicles, selectedId, onSelect }: VehiclePickerProps) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>Veículo</legend>
      <div className={styles.row}>
        {vehicles.map((vehicle) => (
          <OptionPill
            key={vehicle.id}
            name="vehicleId"
            value={vehicle.id}
            checked={onSelect ? vehicle.id === selectedId : undefined}
            defaultChecked={onSelect ? undefined : vehicle.id === selectedId}
            onChange={onSelect ? () => onSelect(vehicle.id) : undefined}
          >
            {vehicleDisplayName(vehicle)}
          </OptionPill>
        ))}
      </div>
    </fieldset>
  );
}
