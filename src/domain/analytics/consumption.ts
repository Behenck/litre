/**
 * Cálculo de consumo.
 *
 * O trecho é sempre derivado de dois abastecimentos consecutivos — nunca é
 * digitado. Só abastecimentos de tanque cheio fecham um trecho: sem tanque
 * cheio não se sabe quanto combustível de fato foi gasto na distância.
 */

import type { FillUp } from '../fill-up/fill-up';
import type { Id } from '../shared/id';

export interface ConsumptionLeg {
  readonly fillUpId: Id;
  /** Distância percorrida no trecho, em km. */
  readonly distance: number;
  /** Litros usados para percorrer a distância. */
  readonly liters: number;
  readonly kmPerLiter: number;
  readonly date: string;
  /** Consumo tão improvável que provavelmente é erro de digitação. */
  readonly suspicious: boolean;
}

const MAX_PLAUSIBLE_KM_PER_LITER = 100;
const MIN_PLAUSIBLE_KM_PER_LITER = 1;

function isSuspicious(kmPerLiter: number): boolean {
  return kmPerLiter > MAX_PLAUSIBLE_KM_PER_LITER || kmPerLiter < MIN_PLAUSIBLE_KM_PER_LITER;
}

/** Ordena por odômetro, que é a ordem real dos eventos independente da data digitada. */
export function sortByOdometer(fillUps: readonly FillUp[]): FillUp[] {
  return [...fillUps].sort((a, b) => a.odometer - b.odometer);
}

/**
 * Trechos calculáveis a partir da sequência de abastecimentos.
 *
 * Um abastecimento parcial não fecha trecho, mas continua no meio da sequência:
 * o trecho seguinte mede a distância desde o abastecimento imediatamente
 * anterior, como faz o odômetro.
 */
export function computeLegs(fillUps: readonly FillUp[]): ConsumptionLeg[] {
  const ordered = sortByOdometer(fillUps);
  const legs: ConsumptionLeg[] = [];

  for (let index = 1; index < ordered.length; index += 1) {
    const current = ordered[index];
    const previous = ordered[index - 1];
    if (!current || !previous) continue;
    if (!current.fullTank) continue;

    const distance = current.odometer - previous.odometer;
    if (distance <= 0 || current.liters <= 0) continue;

    const kmPerLiter = distance / current.liters;
    legs.push({
      fillUpId: current.id,
      distance,
      liters: current.liters,
      kmPerLiter,
      date: current.date,
      suspicious: isSuspicious(kmPerLiter),
    });
  }

  return legs;
}

/**
 * Média ponderada: soma das distâncias ÷ soma dos litros.
 *
 * Não é a média aritmética dos consumos — trechos longos precisam pesar mais
 * que trechos curtos, senão um trecho de 20 km distorce o resultado.
 */
export function weightedAverageKmPerLiter(legs: readonly ConsumptionLeg[]): number {
  if (legs.length === 0) return 0;

  const totalDistance = legs.reduce((total, leg) => total + leg.distance, 0);
  const totalLiters = legs.reduce((total, leg) => total + leg.liters, 0);

  return totalLiters > 0 ? totalDistance / totalLiters : 0;
}

/** Atalho usado pelas telas que só têm a lista de abastecimentos em mãos. */
export function averageKmPerLiter(fillUps: readonly FillUp[]): number {
  return weightedAverageKmPerLiter(computeLegs(fillUps));
}
