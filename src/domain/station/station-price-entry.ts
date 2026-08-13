/**
 * Entrada do histórico de preços de um posto.
 *
 * Append-only: cada anotação de preço vira uma linha nova, nunca editada nem
 * removida. Diferente de `Station` (que guarda só o preço atual), isso
 * preserva a evolução do preço ao longo do tempo.
 */

import type { Id } from '../shared/id';
import { newId } from '../shared/id';
import type { IsoDate } from '../shared/iso-date';
import type { Money } from '../shared/money';
import type { Station } from './station';

export interface StationPriceEntry {
  readonly id: Id;
  readonly stationId: Id;
  readonly gasolinePrice: Money | null;
  readonly ethanolPrice: Money | null;
  readonly dieselPrice: Money | null;
  readonly priceDate: IsoDate;
  readonly recordedBy: Id | null;
  readonly recordedByName: string;
  readonly recordedAt: string;
}

/** Deriva a entrada de histórico de um posto já validado — não pode falhar. */
export function createStationPriceEntry(station: Station): StationPriceEntry {
  return {
    id: newId(),
    stationId: station.id,
    gasolinePrice: station.gasolinePrice,
    ethanolPrice: station.ethanolPrice,
    dieselPrice: station.dieselPrice,
    priceDate: station.priceDate,
    recordedBy: station.updatedBy,
    recordedByName: station.updatedByName,
    recordedAt: station.updatedAt,
  };
}
