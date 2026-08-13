'use client';

import { useActionState, useState } from 'react';
import { IDLE } from '@/app/actions/action-state';
import { createFillUpAction } from '@/app/actions/fill-up-actions';
import { parseDecimalPtBr, parseMoneyPtBr } from '@/domain/shared/number-parser';
import { divideMoney } from '@/domain/shared/money';
import type { Vehicle } from '@/domain/vehicle/vehicle';
import { Card } from '@/ui/components/Card';
import { Field } from '@/ui/components/Field';
import { ButtonLink } from '@/ui/components/PrimaryButton';
import { SubmitButton } from '@/ui/components/SubmitButton';
import { TextInput } from '@/ui/components/TextInput';
import { FuelPicker } from '@/ui/features/vehicles/FuelPicker';
import { VehiclePicker } from '@/ui/features/shared/VehiclePicker';
import { FillUpCalcPanel } from './FillUpCalcPanel';
import { FullTankToggle } from './FullTankToggle';
import styles from './FillUpForm.module.css';

interface FillUpFormProps {
  vehicles: readonly Vehicle[];
  selectedVehicleId: string;
  /** Último odômetro conhecido por veículo, para calcular a distância ao digitar. */
  lastOdometers: Record<string, number>;
  stationNames: readonly string[];
  today: string;
}

function toNumber(raw: string): number | null {
  const parsed = parseDecimalPtBr(raw);
  return parsed.ok ? parsed.value : null;
}

export function FillUpForm({ vehicles, selectedVehicleId, lastOdometers, stationNames, today }: FillUpFormProps) {
  const [state, formAction] = useActionState(createFillUpAction, IDLE);
  const [vehicleId, setVehicleId] = useState(selectedVehicleId);
  const [odometer, setOdometer] = useState('');
  const [liters, setLiters] = useState('');
  const [total, setTotal] = useState('');

  const errors = state.status === 'error' ? (state.fieldErrors ?? {}) : {};
  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === vehicleId);

  // Preço por litro e distância são derivados do que já foi digitado.
  const litersValue = toNumber(liters);
  const totalCents = parseMoneyPtBr(total);
  const pricePerLiterCents =
    litersValue && litersValue > 0 && totalCents.ok && totalCents.value > 0
      ? divideMoney(totalCents.value, litersValue)
      : null;

  const previousOdometer = lastOdometers[vehicleId];
  const odometerValue = toNumber(odometer);
  const distance =
    previousOdometer !== undefined && odometerValue !== null && odometerValue > previousOdometer
      ? odometerValue - previousOdometer
      : null;

  return (
    <form action={formAction} className={styles.form}>
      {vehicles.length > 1 ? (
        <Card>
          <VehiclePicker vehicles={vehicles} selectedId={vehicleId} onSelect={setVehicleId} />
        </Card>
      ) : (
        <input type="hidden" name="vehicleId" value={vehicleId} />
      )}

      <Card>
        <div className={styles.grid}>
          <Field
            label="Quilometragem no painel"
            htmlFor="odometer"
            error={errors.odometer}
            hint={previousOdometer !== undefined ? `Última: ${previousOdometer.toLocaleString('pt-BR')} km` : undefined}
          >
            <TextInput
              id="odometer"
              name="odometer"
              value={odometer}
              onChange={(event) => setOdometer(event.target.value)}
              placeholder={previousOdometer !== undefined ? String(previousOdometer + 400) : '48210'}
              inputMode="decimal"
              mono
              large
              required
              invalid={Boolean(errors.odometer)}
            />
          </Field>

          <Field label="Litros abastecidos" htmlFor="liters" error={errors.liters}>
            <TextInput
              id="liters"
              name="liters"
              value={liters}
              onChange={(event) => setLiters(event.target.value)}
              placeholder="32,4"
              inputMode="decimal"
              mono
              large
              required
              invalid={Boolean(errors.liters)}
            />
          </Field>

          <Field label="Valor total pago (R$)" htmlFor="total" error={errors.total}>
            <TextInput
              id="total"
              name="total"
              value={total}
              onChange={(event) => setTotal(event.target.value)}
              placeholder="198,50"
              inputMode="decimal"
              mono
              large
              required
              invalid={Boolean(errors.total)}
            />
          </Field>

          <Field label="Data" htmlFor="date" error={errors.date}>
            <TextInput id="date" name="date" type="date" defaultValue={today} max={today} large required />
          </Field>
        </div>

        <FillUpCalcPanel pricePerLiterCents={pricePerLiterCents} distance={distance} />
      </Card>

      <Card>
        <FuelPicker
          name="fuel"
          legend="Combustível e posto"
          defaultValue={selectedVehicle?.mainFuel ?? 'gasolina-comum'}
        />

        <div className={`${styles.grid} ${styles.spaced}`}>
          <Field label="Posto" htmlFor="stationName" error={errors.stationName}>
            <TextInput id="stationName" name="stationName" list="postos" placeholder="Shell Av. Brasil" />
            <datalist id="postos">
              {stationNames.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </Field>
          <FullTankToggle />
        </div>

        <p className={styles.note}>
          Tanque cheio deixa a média mais precisa. Abastecimentos parciais entram no gasto, mas não no cálculo.
        </p>
      </Card>

      {state.status === 'error' && !state.fieldErrors ? (
        <p className={styles.formError} role="alert">
          {state.message}
        </p>
      ) : null}

      <div className={styles.actions}>
        <ButtonLink href={`/painel?veiculo=${vehicleId}`} variant="ghost">
          Cancelar
        </ButtonLink>
        <SubmitButton>Salvar abastecimento</SubmitButton>
      </div>
    </form>
  );
}
