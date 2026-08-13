'use client';

import { useActionState } from 'react';
import { IDLE } from '@/app/actions/action-state';
import { saveStationAction } from '@/app/actions/station-actions';
import { Card } from '@/ui/components/Card';
import { Field } from '@/ui/components/Field';
import { SubmitButton } from '@/ui/components/SubmitButton';
import { TextInput } from '@/ui/components/TextInput';
import styles from './StationForm.module.css';

interface StationFormProps {
  /** Nomes já cadastrados, para reconhecer o posto em vez de duplicar. */
  knownNames: readonly string[];
}

export function StationForm({ knownNames }: StationFormProps) {
  const [state, formAction] = useActionState(saveStationAction, IDLE);
  const errors = state.status === 'error' ? (state.fieldErrors ?? {}) : {};

  return (
    <Card legend="Anotar preço" className={styles.card}>
      <form action={formAction} className={styles.row}>
        <Field label="Posto" htmlFor="name" error={errors.name}>
          <TextInput
            id="name"
            name="name"
            list="postos-conhecidos"
            placeholder="Ipiranga Centro"
            required
            invalid={Boolean(errors.name)}
          />
          <datalist id="postos-conhecidos">
            {knownNames.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </Field>

        <Field label="Gasolina" htmlFor="gasoline" error={errors.gasoline}>
          <TextInput id="gasoline" name="gasoline" placeholder="6,29" inputMode="decimal" mono />
        </Field>

        <Field label="Etanol" htmlFor="ethanol" error={errors.ethanol}>
          <TextInput id="ethanol" name="ethanol" placeholder="4,19" inputMode="decimal" mono />
        </Field>

        <Field label="Diesel" htmlFor="diesel" error={errors.diesel}>
          <TextInput id="diesel" name="diesel" placeholder="5,89" inputMode="decimal" mono />
        </Field>

        <div className={styles.submit}>
          <SubmitButton full>Salvar</SubmitButton>
        </div>
      </form>
    </Card>
  );
}
