import type { FillUpRepository } from '../ports/fill-up-repository';
import type { VehicleRepository } from '../ports/vehicle-repository';
import { createFillUp, type FillUp, type FillUpInput } from '@/domain/fill-up/fill-up';
import type { Id } from '@/domain/shared/id';
import { fail, ok, type Result } from '@/domain/shared/result';

/**
 * Registra um abastecimento.
 *
 * A regra de odômetro crescente vive aqui, e não na entidade, porque depende do
 * abastecimento anterior — um dado que a entidade sozinha não conhece.
 */
export async function registerFillUp(
  fillUps: FillUpRepository,
  vehicles: VehicleRepository,
  ownerId: Id,
  input: FillUpInput,
): Promise<Result<FillUp>> {
  const vehicle = await vehicles.findById(ownerId, input.vehicleId);
  if (!vehicle) {
    return fail('nao-encontrado', 'Selecione um veículo válido.', 'vehicleId');
  }

  const created = createFillUp(input);
  if (!created.ok) return created;

  const previous = await fillUps.findLastByVehicle(ownerId, input.vehicleId);
  if (previous && created.value.odometer <= previous.odometer) {
    return fail(
      'odometro-nao-crescente',
      `A quilometragem precisa ser maior que ${previous.odometer.toLocaleString('pt-BR', {
        maximumFractionDigits: 0,
      })} km, do abastecimento anterior.`,
      'odometer',
    );
  }

  await fillUps.save(ownerId, created.value);
  return ok(created.value);
}
