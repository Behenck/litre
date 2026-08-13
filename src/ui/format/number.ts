import {
  type ConsumptionUnit,
  convertFromKmPerLiter,
  unitLabel,
  unitPrecision,
} from '@/domain/shared/consumption-unit';

/** Formatação numérica pt-BR: vírgula decimal e ponto de milhar. */

export function formatDecimal(value: number, digits = 1): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatInteger(value: number): string {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(value);
}

export function formatKm(value: number): string {
  return `${formatInteger(value)} km`;
}

export function formatLiters(value: number): string {
  return formatDecimal(value, 1);
}

export function formatPercent(ratio: number): string {
  return `${formatDecimal(ratio * 100, 0)}%`;
}

/** Consumo já convertido para a unidade escolhida, sem o rótulo. */
export function formatConsumption(kmPerLiter: number, unit: ConsumptionUnit): string {
  if (kmPerLiter <= 0) return '—';
  return formatDecimal(convertFromKmPerLiter(kmPerLiter, unit), unitPrecision(unit));
}

/** Consumo com o rótulo da unidade ("11,98 km/L"). */
export function formatConsumptionWithUnit(kmPerLiter: number, unit: ConsumptionUnit): string {
  if (kmPerLiter <= 0) return '—';
  return `${formatConsumption(kmPerLiter, unit)} ${unitLabel(unit)}`;
}
