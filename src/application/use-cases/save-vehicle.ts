import type { VehicleRepository } from '../ports/vehicle-repository';
import type { Id } from '@/domain/shared/id';
import { fail, ok, type Result } from '@/domain/shared/result';
import { createVehicle, type Vehicle, type VehicleInput } from '@/domain/vehicle/vehicle';

/**
 * Cria ou atualiza um veículo.
 *
 * Quando há id, os campos de auditoria do registro existente são preservados —
 * editar não pode reescrever a data de cadastro.
 */
export async function saveVehicle(
  repository: VehicleRepository,
  ownerId: Id,
  input: VehicleInput,
): Promise<Result<Vehicle>> {
  if (input.id) {
    const existing = await repository.findById(ownerId, input.id);
    if (!existing) {
      return fail('nao-encontrado', 'Veículo não encontrado.');
    }
    const updated = createVehicle({ ...input, createdAt: existing.createdAt });
    if (!updated.ok) return updated;

    await repository.save(ownerId, updated.value);
    return ok(updated.value);
  }

  const created = createVehicle(input);
  if (!created.ok) return created;

  await repository.save(ownerId, created.value);
  return ok(created.value);
}
