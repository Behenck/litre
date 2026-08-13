'use client';

import { useState } from 'react';
import { compareFuels, DEFAULT_YIELD_RATIO } from '@/domain/analytics/fuel-comparison';
import { parseDecimalPtBr, parseOptionalMoneyPtBr } from '@/domain/shared/number-parser';
import { Card } from '@/ui/components/Card';
import { Field } from '@/ui/components/Field';
import { TextInput } from '@/ui/components/TextInput';
import { ComparisonResult } from './ComparisonResult';
import styles from './FuelComparator.module.css';

interface FuelComparatorProps {
  /** Média real do veículo em foco; `null` quando ainda não há dados. */
  gasolineKmPerLiter: number | null;
  vehicleName: string;
  defaultGasolinePrice: string;
  defaultEthanolPrice: string;
}

/**
 * Comparativo interativo.
 *
 * O cálculo é a mesma função pura do domínio usada nos testes — roda no cliente
 * só para responder a cada tecla, sem ida ao servidor.
 */
export function FuelComparator({
  gasolineKmPerLiter,
  vehicleName,
  defaultGasolinePrice,
  defaultEthanolPrice,
}: FuelComparatorProps) {
  const [gasoline, setGasoline] = useState(defaultGasolinePrice);
  const [ethanol, setEthanol] = useState(defaultEthanolPrice);
  const [ratio, setRatio] = useState('0,70');

  const gasolineCents = parseOptionalMoneyPtBr(gasoline);
  const ethanolCents = parseOptionalMoneyPtBr(ethanol);
  const parsedRatio = parseDecimalPtBr(ratio);

  const comparison = compareFuels({
    gasolinePrice: gasolineCents.ok ? gasolineCents.value : null,
    ethanolPrice: ethanolCents.ok ? ethanolCents.value : null,
    yieldRatio: parsedRatio.ok ? parsedRatio.value : DEFAULT_YIELD_RATIO,
    gasolineKmPerLiter,
  });

  return (
    <Card>
      <div className={styles.inputs}>
        <Field label="Preço gasolina (R$/L)" htmlFor="gasoline">
          <TextInput
            id="gasoline"
            value={gasoline}
            onChange={(event) => setGasoline(event.target.value)}
            inputMode="decimal"
            mono
            large
          />
        </Field>
        <Field label="Preço etanol (R$/L)" htmlFor="ethanol">
          <TextInput
            id="ethanol"
            value={ethanol}
            onChange={(event) => setEthanol(event.target.value)}
            inputMode="decimal"
            mono
            large
          />
        </Field>
        <Field
          label="Rendimento etanol/gasolina"
          htmlFor="ratio"
          hint="Padrão 0,70 — ajuste se conhecer o do seu carro"
        >
          <TextInput
            id="ratio"
            value={ratio}
            onChange={(event) => setRatio(event.target.value)}
            inputMode="decimal"
            mono
            large
          />
        </Field>
      </div>

      <ComparisonResult comparison={comparison} />

      <p className={styles.basis}>
        {gasolineKmPerLiter
          ? `Baseado na média atual de ${vehicleName}: ${gasolineKmPerLiter.toLocaleString('pt-BR', {
              maximumFractionDigits: 2,
            })} km/L.`
          : 'Sem média registrada ainda — o custo por km usa uma referência de 12 km/L.'}
      </p>
    </Card>
  );
}
