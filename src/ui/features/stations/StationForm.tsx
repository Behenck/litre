'use client';

import { useActionState } from 'react';
import { IDLE } from '@/app/actions/action-state';
import { saveStationAction } from '@/app/actions/station-actions';
import type { Station } from '@/domain/station/station';
import { Card } from '@/ui/components/Card';
import { Field } from '@/ui/components/Field';
import { SubmitButton } from '@/ui/components/SubmitButton';
import { TextInput } from '@/ui/components/TextInput';
import { moneyToInputValue } from '@/ui/format/currency';
import styles from './StationForm.module.css';

interface StationFormProps {
  /** Nomes já cadastrados, para reconhecer o posto em vez de duplicar. */
  knownNames: readonly string[];
  /** Data de hoje (`YYYY-MM-DD`), para preencher e limitar o campo de data. */
  today: string;
  /** Posto vindo de "Novo preço" no card: preenche nome e preços atuais. */
  prefill?: Station | null;
}

export function StationForm({ knownNames, today, prefill }: StationFormProps) {
  const [state, formAction] = useActionState(saveStationAction, IDLE);
  const errors = state.status === 'error' ? (state.fieldErrors ?? {}) : {};

  return (
    <Card legend={prefill ? `Novo preço — ${prefill.name}` : 'Anotar preço'} className={styles.card}>
      <form action={formAction} className={styles.row}>
        <Field label="Posto" htmlFor="name" error={errors.name}>
          <TextInput
            id="name"
            name="name"
            list="postos-conhecidos"
            placeholder="Ipiranga Centro"
            defaultValue={prefill?.name}
            required
            invalid={Boolean(errors.name)}
          />
          <datalist id="postos-conhecidos">
            {knownNames.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </Field>

        <Field label="Data do preço" htmlFor="priceDate" error={errors.priceDate}>
          <TextInput id="priceDate" name="priceDate" type="date" defaultValue={today} max={today} required />
        </Field>

        <Field label="Gasolina" htmlFor="gasoline" error={errors.gasoline}>
          <TextInput
            id="gasoline"
            name="gasoline"
            placeholder="6,29"
            defaultValue={prefill ? moneyToInputValue(prefill.gasolinePrice) : undefined}
            inputMode="decimal"
            mono
          />
        </Field>

        <Field label="Etanol" htmlFor="ethanol" error={errors.ethanol}>
          <TextInput
            id="ethanol"
            name="ethanol"
            placeholder="4,19"
            defaultValue={prefill ? moneyToInputValue(prefill.ethanolPrice) : undefined}
            inputMode="decimal"
            mono
          />
        </Field>

        <Field label="Diesel" htmlFor="diesel" error={errors.diesel}>
          <TextInput
            id="diesel"
            name="diesel"
            placeholder="5,89"
            defaultValue={prefill ? moneyToInputValue(prefill.dieselPrice) : undefined}
            inputMode="decimal"
            mono
          />
        </Field>

        <div className={styles.submit}>
          <SubmitButton full>Salvar</SubmitButton>
        </div>
      </form>
    </Card>
  );
}
