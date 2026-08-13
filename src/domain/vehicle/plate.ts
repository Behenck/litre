/**
 * Placa do veículo.
 *
 * Aceita o padrão antigo (ABC1234) e o Mercosul (ABC1D23): ambos têm 7
 * caracteres alfanuméricos. Placa vazia é válida — o veículo pode ser cadastrado
 * antes de o dono lembrar dela.
 */

import { fail, ok, type Result } from '../shared/result';

export type Plate = string;

export function normalizePlate(raw: string): Plate {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function createPlate(raw: string): Result<Plate> {
  const normalized = normalizePlate(raw);
  if (normalized.length === 0) return ok('');
  if (normalized.length !== 7) {
    return fail('valor-invalido', 'A placa deve ter 7 caracteres, como ABC1D23.', 'plate');
  }
  return ok(normalized);
}

/** Formatação de leitura: ABC-1D23. */
export function formatPlate(plate: Plate): string {
  if (plate.length !== 7) return plate;
  return `${plate.slice(0, 3)}-${plate.slice(3)}`;
}
