/**
 * Unidade de exibição do consumo.
 *
 * O domínio calcula sempre em km/L; a unidade é uma decisão de apresentação
 * aplicada na última etapa.
 */

export const CONSUMPTION_UNITS = ['km/l', 'l/100km'] as const;

export type ConsumptionUnit = (typeof CONSUMPTION_UNITS)[number];

export const DEFAULT_UNIT: ConsumptionUnit = 'km/l';

export function isConsumptionUnit(value: string): value is ConsumptionUnit {
  return (CONSUMPTION_UNITS as readonly string[]).includes(value);
}

export function unitLabel(unit: ConsumptionUnit): string {
  return unit === 'l/100km' ? 'L/100km' : 'km/L';
}

/** Converte o valor canônico (km/L) para a unidade escolhida. */
export function convertFromKmPerLiter(kmPerLiter: number, unit: ConsumptionUnit): number {
  if (kmPerLiter <= 0) return 0;
  return unit === 'l/100km' ? 100 / kmPerLiter : kmPerLiter;
}

/** Casas decimais adequadas a cada unidade. */
export function unitPrecision(unit: ConsumptionUnit): number {
  return unit === 'l/100km' ? 1 : 2;
}

/**
 * Em km/L, maior é melhor; em L/100km, menor é melhor. Quem desenha gráfico e
 * tendência precisa saber disso sem reimplementar a regra.
 */
export function higherIsBetter(unit: ConsumptionUnit): boolean {
  return unit === 'km/l';
}
