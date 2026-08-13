import type { Id } from '@/domain/shared/id';
import type { FuelType } from '@/domain/vehicle/fuel-type';
import type { Vehicle, VehicleType } from '@/domain/vehicle/vehicle';

/**
 * Tradução entre linha do banco e entidade.
 *
 * Manter isso isolado é o que permite que o formato de linha mude (SQLite →
 * Postgres) sem que a entidade saiba.
 */

export interface VehicleRow {
  id: string;
  user_id: string;
  type: string;
  brand: string;
  model: string;
  year: number | null;
  plate: string;
  color: string;
  color_name: string;
  main_fuel: string;
  nickname: string;
  initial_odometer: number;
  created_at: string;
}

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
