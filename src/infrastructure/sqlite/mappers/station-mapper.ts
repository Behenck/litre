import type { Station } from '@/domain/station/station';

export interface StationRow {
  id: string;
  name: string;
  name_key: string;
  city: string;
  state: string;
  region_key: string;
  gasoline_cents: number | null;
  ethanol_cents: number | null;
  diesel_cents: number | null;
  price_date: string;
  updated_at: string;
  updated_by: string | null;
  updated_by_name: string;
  created_by: string | null;
  created_by_name: string;
}

export function rowToStation(row: StationRow): Station {
  return {
    id: row.id,
    name: row.name,
    nameKey: row.name_key,
    city: row.city,
    state: row.state,
    regionKey: row.region_key,
    gasolinePrice: row.gasoline_cents,
    ethanolPrice: row.ethanol_cents,
    dieselPrice: row.diesel_cents,
    priceDate: row.price_date,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
    updatedByName: row.updated_by_name,
    createdBy: row.created_by,
    createdByName: row.created_by_name,
  };
}

export function stationToRow(station: Station): StationRow {
  return {
    id: station.id,
    name: station.name,
    name_key: station.nameKey,
    city: station.city,
    state: station.state,
    region_key: station.regionKey,
    gasoline_cents: station.gasolinePrice,
    ethanol_cents: station.ethanolPrice,
    diesel_cents: station.dieselPrice,
    price_date: station.priceDate,
    updated_at: station.updatedAt,
    updated_by: station.updatedBy,
    updated_by_name: station.updatedByName,
    created_by: station.createdBy,
    created_by_name: station.createdByName,
  };
}
