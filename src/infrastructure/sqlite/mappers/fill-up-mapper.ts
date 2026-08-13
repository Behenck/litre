import type { FillUp } from '@/domain/fill-up/fill-up';
import type { Id } from '@/domain/shared/id';
import type { FuelType } from '@/domain/vehicle/fuel-type';

/**
 * O SQLite não tem booleano: `full_tank` é 0/1 aqui e vira `boolean` na entidade.
 * Em Postgres a coluna será `boolean` e só este arquivo muda.
 */

export interface FillUpRow {
  id: string;
  user_id: string;
  vehicle_id: string;
  date: string;
  odometer: number;
  liters: number;
  total_cents: number;
  fuel: string;
  station_name: string;
  full_tank: number;
  created_at: string;
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
    fullTank: row.full_tank === 1,
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
    full_tank: fillUp.fullTank ? 1 : 0,
    created_at: fillUp.createdAt,
  };
}
