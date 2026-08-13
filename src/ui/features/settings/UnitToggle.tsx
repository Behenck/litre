'use client';

import { useTransition } from 'react';
import { type ConsumptionUnit, unitLabel } from '@/domain/shared/consumption-unit';
import { toggleUnitAction } from '@/app/actions/preference-actions';
import styles from './ThemeToggle.module.css';

interface UnitToggleProps {
  unit: ConsumptionUnit;
}

/** Alterna entre km/L e L/100km; a conversão em si é feita no servidor. */
export function UnitToggle({ unit }: UnitToggleProps) {
  const [pending, startTransition] = useTransition();
  const next: ConsumptionUnit = unit === 'km/l' ? 'l/100km' : 'km/l';

  return (
    <button
      type="button"
      onClick={() => startTransition(() => void toggleUnitAction())}
      disabled={pending}
      className={`${styles.toggle} ${styles.full}`}
      aria-label={`Unidade atual: ${unitLabel(unit)}. Mudar para ${unitLabel(next)}.`}
    >
      {unitLabel(unit)}
    </button>
  );
}
