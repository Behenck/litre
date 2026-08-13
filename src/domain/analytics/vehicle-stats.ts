/**
 * Indicadores agregados de um veículo.
 *
 * Tudo aqui é derivado dos abastecimentos — nada é armazenado. Excluir um
 * lançamento recalcula todos os números na leitura seguinte.
 */

import type { FillUp } from '../fill-up/fill-up';
import { pricePerLiter } from '../fill-up/fill-up';
import { type Money, sumMoney } from '../shared/money';
import { type ConsumptionLeg, computeLegs, sortByOdometer, weightedAverageKmPerLiter } from './consumption';

export interface VehicleStats {
  readonly legs: ConsumptionLeg[];
  readonly averageKmPerLiter: number;
  /** Centavos por quilômetro rodado. */
  readonly costPerKm: Money;
  readonly lastPricePerLiter: Money;
  readonly totalSpent: Money;
  readonly totalLiters: number;
  readonly fillUpCount: number;
  /** Variação percentual do último trecho contra o anterior; `null` sem base. */
  readonly trend: number | null;
}

export function computeVehicleStats(fillUps: readonly FillUp[]): VehicleStats {
  const ordered = sortByOdometer(fillUps);
  const legs = computeLegs(ordered);
  const average = weightedAverageKmPerLiter(legs);

  const last = ordered.at(-1);
  const lastPrice = last ? pricePerLiter(last) : 0;

  // Custo por km: quanto custa rodar 1 km ao preço mais recente.
  const costPerKm = average > 0 ? Math.round(lastPrice / average) : 0;

  const current = legs.at(-1);
  const previous = legs.at(-2);
  const trend =
    current && previous && previous.kmPerLiter > 0
      ? (current.kmPerLiter - previous.kmPerLiter) / previous.kmPerLiter
      : null;

  return {
    legs,
    averageKmPerLiter: average,
    costPerKm,
    lastPricePerLiter: lastPrice,
    // Parciais entram no gasto e nos litros, mas não na média.
    totalSpent: sumMoney(ordered.map((fillUp) => fillUp.total)),
    totalLiters: ordered.reduce((total, fillUp) => total + fillUp.liters, 0),
    fillUpCount: ordered.length,
    trend,
  };
}

/** Consumo de um abastecimento específico, quando ele fecha um trecho. */
export function legForFillUp(legs: readonly ConsumptionLeg[], fillUpId: string): ConsumptionLeg | null {
  return legs.find((leg) => leg.fillUpId === fillUpId) ?? null;
}
