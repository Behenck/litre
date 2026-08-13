/**
 * Catálogo de combustíveis.
 *
 * Aberto a extensão (OCP): incluir um combustível novo é acrescentar uma entrada
 * aqui — nenhum `switch` espalhado pelo código precisa mudar.
 */

export const FUEL_TYPES = [
  { value: 'gasolina-comum', label: 'Gasolina comum', shortLabel: 'Gasolina', relativeYield: 1 },
  { value: 'gasolina-aditivada', label: 'Gasolina aditivada', shortLabel: 'Aditivada', relativeYield: 1 },
  { value: 'etanol', label: 'Etanol', shortLabel: 'Etanol', relativeYield: 0.7 },
  { value: 'diesel', label: 'Diesel', shortLabel: 'Diesel', relativeYield: 1.25 },
  { value: 'gnv', label: 'GNV', shortLabel: 'GNV', relativeYield: 1 },
  { value: 'eletrico', label: 'Elétrico', shortLabel: 'Elétrico', relativeYield: 1 },
] as const;

export type FuelType = (typeof FUEL_TYPES)[number]['value'];
export type FuelDescriptor = (typeof FUEL_TYPES)[number];

export const DEFAULT_FUEL: FuelType = 'gasolina-comum';

const BY_VALUE = new Map<string, FuelDescriptor>(FUEL_TYPES.map((fuel) => [fuel.value, fuel]));

export function isFuelType(value: string): value is FuelType {
  return BY_VALUE.has(value);
}

export function fuelLabel(value: FuelType): string {
  return BY_VALUE.get(value)?.label ?? value;
}

export function fuelShortLabel(value: FuelType): string {
  return BY_VALUE.get(value)?.shortLabel ?? value;
}

/** Rendimento do combustível em relação à gasolina, usado no comparativo. */
export function fuelRelativeYield(value: FuelType): number {
  return BY_VALUE.get(value)?.relativeYield ?? 1;
}
