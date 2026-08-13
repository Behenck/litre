import type { FillUp } from '@/domain/fill-up/fill-up';
import type { Id } from '@/domain/shared/id';
import type { Station } from '@/domain/station/station';
import type { StationPriceEntry } from '@/domain/station/station-price-entry';
import type { FuelType } from '@/domain/vehicle/fuel-type';
import type { Vehicle, VehicleType } from '@/domain/vehicle/vehicle';
import type { Tables } from './database.types';

type VehicleRow = Tables<'vehicles'>;
type FillUpRow = Tables<'fill_ups'>;
type StationRow = Tables<'stations'>;
type StationPriceHistoryRow = Tables<'station_price_history'>;

export function rowToVehicle(row: VehicleRow): Vehicle {
  return {
    id: row.id,
    type: row.type as VehicleType,
    brand: row.brand,
    model: row.model,
    year: row.year,
    plate: row.plate,
    color: row.color,
    colorName: row.color_name,
    mainFuel: row.main_fuel as FuelType,
    nickname: row.nickname,
    initialOdometer: row.initial_odometer,
    createdAt: row.created_at,
  };
}

export function vehicleToRow(ownerId: Id, vehicle: Vehicle): VehicleRow {
  return {
    id: vehicle.id,
    user_id: ownerId,
    type: vehicle.type,
    brand: vehicle.brand,
    model: vehicle.model,
    year: vehicle.year,
    plate: vehicle.plate,
    color: vehicle.color,
    color_name: vehicle.colorName,
    main_fuel: vehicle.mainFuel,
    nickname: vehicle.nickname,
    initial_odometer: vehicle.initialOdometer,
    created_at: vehicle.createdAt,
  };
}

export function rowToFillUp(row: FillUpRow): FillUp {
  return {
    id: row.id,
    vehicleId: row.vehicle_id,
    date: row.date,
    odometer: row.odometer,
    liters: row.liters,
    total: row.total_cents,
    fuel: row.fuel as FuelType,
    stationName: row.station_name,
    fullTank: row.full_tank,
    createdAt: row.created_at,
  };
}

export function fillUpToRow(ownerId: Id, fillUp: FillUp): FillUpRow {
  return {
    id: fillUp.id,
    user_id: ownerId,
    vehicle_id: fillUp.vehicleId,
    date: fillUp.date,
    odometer: fillUp.odometer,
    liters: fillUp.liters,
    total_cents: fillUp.total,
    fuel: fillUp.fuel,
    station_name: fillUp.stationName,
    full_tank: fillUp.fullTank,
    created_at: fillUp.createdAt,
  };
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
  };
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
