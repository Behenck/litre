/**
 * Entidade Veículo.
 *
 * A construção rejeita estado inválido: não existe `Vehicle` sem modelo, com ano
 * impossível ou com placa malformada.
 */

import { type Id, newId } from '../shared/id';
import { type IsoDate, today } from '../shared/iso-date';
import { fail, ok, type Result } from '../shared/result';
import { DEFAULT_FUEL, type FuelType, isFuelType } from './fuel-type';
import { createPlate, type Plate } from './plate';
import { colorNameFor, DEFAULT_COLOR } from './vehicle-color';

export const VEHICLE_TYPES = [
  { value: 'carro', label: 'Carro', icon: '🚗' },
  { value: 'moto', label: 'Moto', icon: '🏍️' },
] as const;

export type VehicleType = (typeof VEHICLE_TYPES)[number]['value'];

export function isVehicleType(value: string): value is VehicleType {
  return VEHICLE_TYPES.some((type) => type.value === value);
}

export interface Vehicle {
  readonly id: Id;
  readonly type: VehicleType;
  readonly brand: string;
  readonly model: string;
  readonly year: number | null;
  readonly plate: Plate;
  readonly color: string;
  readonly colorName: string;
  readonly mainFuel: FuelType;
  readonly nickname: string;
  readonly initialOdometer: number;
  readonly createdAt: IsoDate;
}

export interface VehicleInput {
  readonly id?: Id;
  readonly type: string;
  readonly brand: string;
  readonly model: string;
  readonly year: number | null;
  readonly plate: string;
  readonly color: string;
  readonly mainFuel: string;
  readonly nickname: string;
  readonly initialOdometer: number;
  readonly createdAt?: IsoDate;
}

const MAX_BRAND = 40;
const MAX_MODEL = 60;
const MAX_NICKNAME = 40;

export function createVehicle(input: VehicleInput): Result<Vehicle> {
  const model = input.model.trim();
  if (model === '') {
    return fail('campo-obrigatorio', 'Informe ao menos o modelo do veículo.', 'model');
  }
  if (model.length > MAX_MODEL) {
    return fail('fora-de-faixa', `O modelo deve ter até ${MAX_MODEL} caracteres.`, 'model');
  }

  const brand = input.brand.trim();
  if (brand.length > MAX_BRAND) {
    return fail('fora-de-faixa', `A marca deve ter até ${MAX_BRAND} caracteres.`, 'brand');
  }

  const nickname = input.nickname.trim();
  if (nickname.length > MAX_NICKNAME) {
    return fail('fora-de-faixa', `O apelido deve ter até ${MAX_NICKNAME} caracteres.`, 'nickname');
  }

  if (input.year !== null) {
    const maxYear = new Date().getFullYear() + 1;
    if (!Number.isInteger(input.year) || input.year < 1900 || input.year > maxYear) {
      return fail('fora-de-faixa', `Informe um ano entre 1900 e ${maxYear}.`, 'year');
    }
  }

  if (!Number.isFinite(input.initialOdometer) || input.initialOdometer < 0) {
    return fail('valor-invalido', 'A quilometragem não pode ser negativa.', 'odometer');
  }

  const plate = createPlate(input.plate);
  if (!plate.ok) return plate;

  const color = input.color.trim() || DEFAULT_COLOR.hex;

  return ok({
    id: input.id ?? newId(),
    type: isVehicleType(input.type) ? input.type : 'carro',
    brand,
    model,
    year: input.year,
    plate: plate.value,
    color,
    colorName: colorNameFor(color),
    mainFuel: isFuelType(input.mainFuel) ? input.mainFuel : DEFAULT_FUEL,
    nickname,
    initialOdometer: Math.round(input.initialOdometer * 10) / 10,
    createdAt: input.createdAt ?? today(),
  });
}

/** Nome exibido: apelido > marca + modelo > rótulo genérico. */
export function vehicleDisplayName(vehicle: Vehicle): string {
  if (vehicle.nickname) return vehicle.nickname;
  const composed = [vehicle.brand, vehicle.model].filter(Boolean).join(' ').trim();
  return composed || 'Veículo';
}
