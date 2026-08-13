'use client';

import { useState } from 'react';
import styles from './FullTankToggle.module.css';

/**
 * Alternador de tanque cheio.
 *
 * É um checkbox real (entra no FormData como presente/ausente) desenhado como
 * botão, para acompanhar a altura dos campos ao lado.
 */
export function FullTankToggle() {
  const [checked, setChecked] = useState(true);

  return (
    <div className={styles.wrapper}>
      <span className={styles.label} id="tanque-label">
        Tanque cheio?
      </span>
      <label className={checked ? `${styles.toggle} ${styles.on}` : styles.toggle}>
        <input
          type="checkbox"
          name="fullTank"
          checked={checked}
          onChange={(event) => setChecked(event.target.checked)}
          className={styles.input}
          aria-labelledby="tanque-label"
        />
        <span>{checked ? 'Sim, enchi o tanque' : 'Não, foi parcial'}</span>
      </label>
    </div>
  );
}
