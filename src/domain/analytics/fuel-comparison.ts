/**
 * Comparativo etanol × gasolina.
 *
 * A regra popular dos 70% é só o caso particular em que o rendimento do etanol
 * é 0,70 do da gasolina. Aqui o fator é configurável e, quando o veículo já tem
 * média real, o custo por quilômetro sai dela.
 */

import type { Money } from '../shared/money';

export const DEFAULT_YIELD_RATIO = 0.7;

export type ComparisonWinner = 'etanol' | 'gasolina' | 'indefinido';

export interface FuelComparison {
  readonly winner: ComparisonWinner;
  /** Preço do etanol como fração do preço da gasolina (0,67 = 67%). */
  readonly priceRatio: number | null;
  readonly yieldRatio: number;
  /** Centavos por km com cada combustível; `null` quando falta dado. */
  readonly costPerKmGasoline: Money | null;
  readonly costPerKmEthanol: Money | null;
  readonly explanation: string;
}

interface ComparisonInput {
  readonly gasolinePrice: Money | null;
  readonly ethanolPrice: Money | null;
  /** Fator de rendimento etanol/gasolina; valores fora de (0,1] caem no padrão. */
  readonly yieldRatio: number | null;
  /** Média real do veículo em km/L com gasolina; ausente usa uma referência. */
  readonly gasolineKmPerLiter: number | null;
}

const FALLBACK_KM_PER_LITER = 12;

function normalizeYieldRatio(ratio: number | null): number {
  if (ratio === null || !Number.isFinite(ratio) || ratio <= 0 || ratio > 1) {
    return DEFAULT_YIELD_RATIO;
  }
  return ratio;
}

export function compareFuels(input: ComparisonInput): FuelComparison {
  const yieldRatio = normalizeYieldRatio(input.yieldRatio);
  const { gasolinePrice, ethanolPrice } = input;

  if (!gasolinePrice || !ethanolPrice || gasolinePrice <= 0 || ethanolPrice <= 0) {
    return {
      winner: 'indefinido',
      priceRatio: null,
      yieldRatio,
      costPerKmGasoline: null,
      costPerKmEthanol: null,
      explanation: 'Informe os preços de gasolina e etanol para ver a recomendação.',
    };
  }

  const priceRatio = ethanolPrice / gasolinePrice;
  const ethanolWins = priceRatio < yieldRatio;

  const gasolineKmPerLiter = input.gasolineKmPerLiter && input.gasolineKmPerLiter > 0
    ? input.gasolineKmPerLiter
    : FALLBACK_KM_PER_LITER;
  const ethanolKmPerLiter = gasolineKmPerLiter * yieldRatio;

  const percent = Math.round(priceRatio * 100);
  const limit = Math.round(yieldRatio * 100);

  return {
    winner: ethanolWins ? 'etanol' : 'gasolina',
    priceRatio,
    yieldRatio,
    costPerKmGasoline: Math.round(gasolinePrice / gasolineKmPerLiter),
    costPerKmEthanol: Math.round(ethanolPrice / ethanolKmPerLiter),
    explanation: ethanolWins
      ? `O etanol está a ${percent}% do preço da gasolina — abaixo do limite de ${limit}%.`
      : `O etanol está a ${percent}% do preço da gasolina — acima do limite de ${limit}%.`,
  };
}
