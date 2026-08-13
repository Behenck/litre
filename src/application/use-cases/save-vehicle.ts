import type { VehicleRepository } from '../ports/vehicle-repository';
import { fail, ok, type Result } from '@/domain/shared/result';
import { createVehicle, type Vehicle, type VehicleInput } from '@/domain/vehicle/vehicle';

/**
 * Cria ou atualiza um veículo.
 *
 * Quando há id, os campos de auditoria do registro existente são preservados —
 * editar não pode reescrever a data de cadastro.
 */
export async function saveVehicle(repository: VehicleRepository, input: VehicleInput): Promise<Result<Vehicle>> {
  if (input.id) {
    const existing = await repository.findById(input.id);
    if (!existing) {
      return fail('nao-encontrado', 'Veículo não encontrado.');
    }
    const updated = createVehicle({ ...input, createdAt: existing.createdAt });
    if (!updated.ok) return updated;

    await repository.save(updated.value);
    return ok(updated.value);
  }

  const created = createVehicle(input);
  if (!created.ok) return created;

  await repository.save(created.value);
  return ok(created.value);
}
