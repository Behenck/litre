'use client';

import { useActionState } from 'react';
import { IDLE } from '@/app/actions/action-state';
import { updateRegionAction } from '@/app/actions/station-actions';
import { SubmitButton } from '@/ui/components/SubmitButton';
import { TextInput } from '@/ui/components/TextInput';
import styles from './RegionForm.module.css';
import { StateSelect } from './StateSelect';

interface RegionFormProps {
  city: string;
  state: string;
}

/** Mudou de cidade? Trocar aqui troca a praça de postos que você enxerga. */
export function RegionForm({ city, state }: RegionFormProps) {
  const [formState, formAction] = useActionState(updateRegionAction, IDLE);
  const errors = formState.status === 'error' ? (formState.fieldErrors ?? {}) : {};

  return (
    <form action={formAction} className={styles.form}>
      <TextInput
        aria-label="Cidade"
        name="city"
        defaultValue={city}
        placeholder="Curitiba"
        required
        invalid={Boolean(errors.city)}
      />
      <StateSelect id="region-state" name="state" defaultValue={state} invalid={Boolean(errors.state)} />
      <SubmitButton variant="ghost">Salvar</SubmitButton>

      {formState.status === 'error' ? (
        <strong className={styles.error} role="alert">
          {formState.message}
        </strong>
      ) : null}
    </form>
  );
}
