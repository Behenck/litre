/**
 * Entidade Posto.
 *
 * O nome é a chave natural: salvar um posto já conhecido atualiza os preços em
 * vez de criar duplicata. `nameKey` é a forma normalizada usada na comparação.
 */

import { type Id, newId } from '../shared/id';
import { nowTimestamp } from '../shared/iso-date';
import type { Money } from '../shared/money';
import { fail, ok, type Result } from '../shared/result';

export interface Station {
  readonly id: Id;
  readonly name: string;
  readonly nameKey: string;
  readonly gasolinePrice: Money | null;
  readonly ethanolPrice: Money | null;
  readonly dieselPrice: Money | null;
  readonly updatedAt: string;
}

export interface StationInput {
  readonly id?: Id;
  readonly name: string;
  readonly gasolinePrice: Money | null;
  readonly ethanolPrice: Money | null;
  readonly dieselPrice: Money | null;
  readonly updatedAt?: string;
}

const MAX_NAME = 60;

/** Minúsculas, sem acento e sem espaços extras: "Shell  Av. Brasil" ≡ "shell av. brasil". */
export function stationNameKey(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

function validatePrice(price: Money | null, field: string, label: string): Result<Money | null> {
  if (price === null) return ok(null);
  if (!Number.isInteger(price) || price <= 0) {
    return fail('valor-invalido', `O preço do ${label} precisa ser maior que zero.`, field);
  }
  return ok(price);
}

export function createStation(input: StationInput): Result<Station> {
  const name = input.name.trim();
  if (name === '') {
    return fail('campo-obrigatorio', 'Informe o nome do posto.', 'name');
  }
  if (name.length > MAX_NAME) {
    return fail('fora-de-faixa', `O nome do posto deve ter até ${MAX_NAME} caracteres.`, 'name');
  }

  const gasoline = validatePrice(input.gasolinePrice, 'gasoline', 'gasolina');
  if (!gasoline.ok) return gasoline;
  const ethanol = validatePrice(input.ethanolPrice, 'ethanol', 'etanol');
  if (!ethanol.ok) return ethanol;
  const diesel = validatePrice(input.dieselPrice, 'diesel', 'diesel');
  if (!diesel.ok) return diesel;

  return ok({
    id: input.id ?? newId(),
    name,
    nameKey: stationNameKey(name),
    gasolinePrice: gasoline.value,
    ethanolPrice: ethanol.value,
    dieselPrice: diesel.value,
    updatedAt: input.updatedAt ?? nowTimestamp(),
  });
}

/** Id do posto com a gasolina mais barata, ou `null` se nenhum tiver preço. */
export function cheapestGasolineStationId(stations: readonly Station[]): Id | null {
  let cheapest: Station | null = null;
  for (const station of stations) {
    if (station.gasolinePrice === null) continue;
    if (cheapest === null || station.gasolinePrice < (cheapest.gasolinePrice ?? Infinity)) {
      cheapest = station;
    }
  }
  return cheapest?.id ?? null;
}
