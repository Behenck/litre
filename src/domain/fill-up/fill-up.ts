/**
 * Entidade Abastecimento.
 *
 * Valida o que depende só de si mesma. A regra de odômetro crescente depende do
 * abastecimento anterior e por isso vive no caso de uso `register-fill-up`.
 */

import { type Id, newId } from '../shared/id';
import { isFutureDate, isValidIsoDate, type IsoDate, today } from '../shared/iso-date';
import { divideMoney, type Money } from '../shared/money';
import { fail, ok, type Result } from '../shared/result';
import { DEFAULT_FUEL, type FuelType, isFuelType } from '../vehicle/fuel-type';

export interface FillUp {
  readonly id: Id;
  readonly vehicleId: Id;
  readonly date: IsoDate;
  readonly odometer: number;
  readonly liters: number;
  readonly total: Money;
  readonly fuel: FuelType;
  readonly stationName: string;
  readonly fullTank: boolean;
  readonly createdAt: IsoDate;
}

export interface FillUpInput {
  readonly id?: Id;
  readonly vehicleId: Id;
  readonly date: string;
  readonly odometer: number;
  readonly liters: number;
  readonly total: Money;
  readonly fuel: string;
  readonly stationName: string;
  readonly fullTank: boolean;
  readonly createdAt?: IsoDate;
}

const MAX_STATION_NAME = 60;

export function createFillUp(input: FillUpInput): Result<FillUp> {
  if (!input.vehicleId) {
    return fail('campo-obrigatorio', 'Selecione o veículo abastecido.', 'vehicleId');
  }
  if (!isValidIsoDate(input.date)) {
    return fail('valor-invalido', 'Informe uma data válida.', 'date');
  }
  if (isFutureDate(input.date)) {
    return fail('data-futura', 'A data do abastecimento não pode estar no futuro.', 'date');
  }
  if (!Number.isFinite(input.odometer) || input.odometer < 0) {
    return fail('valor-invalido', 'Informe a quilometragem do painel.', 'odometer');
  }
  if (!Number.isFinite(input.liters) || input.liters <= 0) {
    return fail('valor-invalido', 'Os litros precisam ser maiores que zero.', 'liters');
  }
  if (!Number.isInteger(input.total) || input.total <= 0) {
    return fail('valor-invalido', 'O valor pago precisa ser maior que zero.', 'total');
  }

  const stationName = input.stationName.trim().slice(0, MAX_STATION_NAME);

  return ok({
    id: input.id ?? newId(),
    vehicleId: input.vehicleId,
    date: input.date,
    odometer: Math.round(input.odometer * 10) / 10,
    liters: Math.round(input.liters * 1000) / 1000,
    total: input.total,
    fuel: isFuelType(input.fuel) ? input.fuel : DEFAULT_FUEL,
    stationName,
    fullTank: input.fullTank,
    createdAt: input.createdAt ?? today(),
  });
}

/** Preço por litro em centavos, derivado — nunca digitado. */
export function pricePerLiter(fillUp: Pick<FillUp, 'total' | 'liters'>): Money {
  return divideMoney(fillUp.total, fillUp.liters);
}
