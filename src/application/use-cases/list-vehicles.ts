import type { FillUpRepository } from '../ports/fill-up-repository';
import type { VehicleRepository } from '../ports/vehicle-repository';
import { averageKmPerLiter } from '@/domain/analytics/consumption';
import type { Id } from '@/domain/shared/id';
import type { Vehicle } from '@/domain/vehicle/vehicle';

/** Veículo já acompanhado do que a lista precisa mostrar. */
export interface VehicleSummary {
  readonly vehicle: Vehicle;
  readonly averageKmPerLiter: number;
  readonly currentOdometer: number;
  readonly fillUpCount: number;
}

/**
 * Lista os veículos com seus indicadores.
 *
 * O odômetro exibido é o maior entre o informado no cadastro e o último
 * abastecimento — o painel do carro nunca anda para trás.
 */
export async function listVehicles(
  vehicles: VehicleRepository,
  fillUps: FillUpRepository,
  ownerId: Id,
): Promise<VehicleSummary[]> {
  const all = await vehicles.list(ownerId);

  return Promise.all(
    all.map(async (vehicle) => {
      const vehicleFillUps = await fillUps.listByVehicle(ownerId, vehicle.id);
      const last = vehicleFillUps.at(-1);

      return {
        vehicle,
        averageKmPerLiter: averageKmPerLiter(vehicleFillUps),
        currentOdometer: Math.max(vehicle.initialOdometer, last?.odometer ?? 0),
        fillUpCount: vehicleFillUps.length,
      };
    }),
  );
}
