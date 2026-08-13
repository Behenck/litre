import type { VehicleRepository } from '../ports/vehicle-repository';
import type { Id } from '@/domain/shared/id';
import { fail, ok, type Result } from '@/domain/shared/result';

export interface DeletedVehicle {
  readonly name: string;
  /** Quantos abastecimentos foram removidos junto — a UI informa isso ao usuário. */
  readonly removedFillUps: number;
}

export async function deleteVehicle(repository: VehicleRepository, id: Id): Promise<Result<DeletedVehicle>> {
  const vehicle = await repository.findById(id);
  if (!vehicle) {
    return fail('nao-encontrado', 'Veículo não encontrado.');
  }

  const removedFillUps = await repository.countFillUps(id);
  await repository.delete(id);

  return ok({ name: vehicle.model, removedFillUps });
}
