import type { StationPriceEntry } from '@/domain/station/station-price-entry';

export interface StationPriceHistoryRow {
  id: string;
  station_id: string;
  gasoline_cents: number | null;
  ethanol_cents: number | null;
  diesel_cents: number | null;
  price_date: string;
  recorded_by: string | null;
  recorded_by_name: string;
  recorded_at: string;
}

export function rowToStationPriceEntry(row: StationPriceHistoryRow): StationPriceEntry {
  return {
    id: row.id,
    stationId: row.station_id,
    gasolinePrice: row.gasoline_cents,
    ethanolPrice: row.ethanol_cents,
    dieselPrice: row.diesel_cents,
    priceDate: row.price_date,
    recordedBy: row.recorded_by,
    recordedByName: row.recorded_by_name,
    recordedAt: row.recorded_at,
  };
}

export function stationPriceEntryToRow(entry: StationPriceEntry): StationPriceHistoryRow {
  return {
    id: entry.id,
    station_id: entry.stationId,
    gasoline_cents: entry.gasolinePrice,
    ethanol_cents: entry.ethanolPrice,
    diesel_cents: entry.dieselPrice,
    price_date: entry.priceDate,
    recorded_by: entry.recordedBy,
    recorded_by_name: entry.recordedByName,
    recorded_at: entry.recordedAt,
  };
}
