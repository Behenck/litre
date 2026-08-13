import type { Station } from '@/domain/station/station';

export interface StationRow {
  id: string;
  name: string;
  name_key: string;
  gasoline_cents: number | null;
  ethanol_cents: number | null;
  diesel_cents: number | null;
  updated_at: string;
}

export function rowToStation(row: StationRow): Station {
  return {
    id: row.id,
    name: row.name,
    nameKey: row.name_key,
    gasolinePrice: row.gasoline_cents,
    ethanolPrice: row.ethanol_cents,
    dieselPrice: row.diesel_cents,
    updatedAt: row.updated_at,
  };
}

export function stationToRow(station: Station): StationRow {
  return {
    id: station.id,
    name: station.name,
    name_key: station.nameKey,
    gasoline_cents: station.gasolinePrice,
    ethanol_cents: station.ethanolPrice,
    diesel_cents: station.dieselPrice,
    updated_at: station.updatedAt,
  };
}
