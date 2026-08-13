import { VEHICLE_TYPES, type VehicleType } from '@/domain/vehicle/vehicle';
import { OptionPill } from '@/ui/components/OptionPill';
import styles from './PickerRow.module.css';

interface VehicleTypePickerProps {
  defaultValue: VehicleType;
}

export function VehicleTypePicker({ defaultValue }: VehicleTypePickerProps) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>Tipo</legend>
      <div className={styles.row}>
        {VEHICLE_TYPES.map((type) => (
          <OptionPill key={type.value} name="type" value={type.value} defaultChecked={type.value === defaultValue} variant="card">
            <span className={styles.icon} aria-hidden="true">
              {type.icon}
            </span>
            <span>{type.label}</span>
          </OptionPill>
        ))}
      </div>
    </fieldset>
  );
}
