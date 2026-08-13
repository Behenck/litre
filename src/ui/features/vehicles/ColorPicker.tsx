'use client';

import { useState } from 'react';
import { VEHICLE_COLORS } from '@/domain/vehicle/vehicle-color';
import styles from './ColorPicker.module.css';

interface ColorPickerProps {
  defaultValue: string;
}

/**
 * Escolha de cor.
 *
 * Cliente apenas para exibir o nome da cor selecionada; a seleção em si continua
 * sendo um grupo de radios que entra no FormData.
 */
export function ColorPicker({ defaultValue }: ColorPickerProps) {
  const [selected, setSelected] = useState(defaultValue);
  const selectedName = VEHICLE_COLORS.find((color) => color.hex === selected)?.name ?? '';

  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>Cor</legend>
      <div className={styles.row}>
        {VEHICLE_COLORS.map((color) => (
          <label key={color.hex} className={styles.swatch} title={color.name}>
            <input
              type="radio"
              name="color"
              value={color.hex}
              checked={selected === color.hex}
              onChange={() => setSelected(color.hex)}
              className={styles.input}
            />
            <span className={styles.chip} style={{ background: color.hex }} />
            <span className="srOnly">{color.name}</span>
          </label>
        ))}
        <span className={styles.name}>{selectedName}</span>
      </div>
    </fieldset>
  );
}
