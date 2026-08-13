'use client';

import { useActionState } from 'react';
import { saveVehicleAction } from '@/app/actions/vehicle-actions';
import { IDLE } from '@/app/actions/action-state';
import type { Vehicle } from '@/domain/vehicle/vehicle';
import { DEFAULT_FUEL } from '@/domain/vehicle/fuel-type';
import { DEFAULT_COLOR } from '@/domain/vehicle/vehicle-color';
import { Card } from '@/ui/components/Card';
import { Field } from '@/ui/components/Field';
import { ButtonLink } from '@/ui/components/PrimaryButton';
import { SubmitButton } from '@/ui/components/SubmitButton';
import { TextInput } from '@/ui/components/TextInput';
import { ColorPicker } from './ColorPicker';
import { FuelPicker } from './FuelPicker';
import { VehicleTypePicker } from './VehicleTypePicker';
import styles from './VehicleForm.module.css';

interface VehicleFormProps {
  /** Presente na edição; ausente no cadastro. */
  vehicle?: Vehicle;
}

export function VehicleForm({ vehicle }: VehicleFormProps) {
  const [state, formAction] = useActionState(saveVehicleAction, IDLE);
  const errors = state.status === 'error' ? (state.fieldErrors ?? {}) : {};

  return (
    <form action={formAction} className={styles.form}>
      {vehicle ? <input type="hidden" name="id" value={vehicle.id} /> : null}

      <Card>
        <VehicleTypePicker defaultValue={vehicle?.type ?? 'carro'} />
      </Card>

      <Card legend="Identificação">
        <div className={styles.grid}>
          <Field label="Marca" htmlFor="brand" error={errors.brand}>
            <TextInput id="brand" name="brand" defaultValue={vehicle?.brand ?? ''} placeholder="Honda" />
          </Field>
          <Field label="Modelo" htmlFor="model" error={errors.model}>
            <TextInput
              id="model"
              name="model"
              defaultValue={vehicle?.model ?? ''}
              placeholder="Civic EXL"
              required
              invalid={Boolean(errors.model)}
            />
          </Field>
          <Field label="Ano" htmlFor="year" error={errors.year}>
            <TextInput
              id="year"
              name="year"
              defaultValue={vehicle?.year ?? ''}
              placeholder="2019"
              inputMode="numeric"
              mono
              invalid={Boolean(errors.year)}
            />
          </Field>
          <Field label="Placa" htmlFor="plate" error={errors.plate}>
            <TextInput
              id="plate"
              name="plate"
              defaultValue={vehicle?.plate ?? ''}
              placeholder="ABC1D23"
              mono
              className={styles.plate}
              invalid={Boolean(errors.plate)}
            />
          </Field>
        </div>
      </Card>

      <Card>
        <ColorPicker defaultValue={vehicle?.color ?? DEFAULT_COLOR.hex} />
      </Card>

      <Card>
        <FuelPicker name="mainFuel" legend="Combustível principal" defaultValue={vehicle?.mainFuel ?? DEFAULT_FUEL} />
        <div className={`${styles.grid} ${styles.spaced}`}>
          <Field label="Quilometragem atual (km)" htmlFor="odometer" error={errors.odometer}>
            <TextInput
              id="odometer"
              name="odometer"
              defaultValue={vehicle?.initialOdometer ?? ''}
              placeholder="48210"
              inputMode="decimal"
              mono
              invalid={Boolean(errors.odometer)}
            />
          </Field>
          <Field label="Apelido (opcional)" htmlFor="nickname" error={errors.nickname}>
            <TextInput
              id="nickname"
              name="nickname"
              defaultValue={vehicle?.nickname ?? ''}
              placeholder="Carro do trabalho"
            />
          </Field>
        </div>
      </Card>

      {state.status === 'error' && !state.fieldErrors ? (
        <p className={styles.formError} role="alert">
          {state.message}
        </p>
      ) : null}

      <div className={styles.actions}>
        <ButtonLink href="/" variant="ghost">
          Cancelar
        </ButtonLink>
        <SubmitButton>Salvar veículo</SubmitButton>
      </div>
    </form>
  );
}
