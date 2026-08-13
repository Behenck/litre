import { FUEL_TYPES, type FuelType } from '@/domain/vehicle/fuel-type';
import { OptionPill } from '@/ui/components/OptionPill';
import styles from './PickerRow.module.css';

interface FuelPickerProps {
  name: string;
  legend: string;
  defaultValue: FuelType;
}

/** Escolha de combustível, usada tanto no cadastro quanto no abastecimento. */
export function FuelPicker({ name, legend, defaultValue }: FuelPickerProps) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.row}>
        {FUEL_TYPES.map((fuel) => (
          <OptionPill key={fuel.value} name={name} value={fuel.value} defaultChecked={fuel.value === defaultValue}>
            {fuel.label}
          </OptionPill>
        ))}
      </div>
    </fieldset>
  );
}
