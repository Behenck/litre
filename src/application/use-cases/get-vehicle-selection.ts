import type { VehicleRepository } from '../ports/vehicle-repository';
import type { Id } from '@/domain/shared/id';
import type { Vehicle } from '@/domain/vehicle/vehicle';

export interface VehicleSelection {
  readonly vehicles: Vehicle[];
  /** `null` só quando não há nenhum veículo cadastrado. */
  readonly selected: Vehicle | null;
}

/**
 * Resolve o veículo em foco a partir do parâmetro `?veiculo=`.
 *
 * Um id inválido ou ausente cai para o primeiro veículo, em vez de erro: a tela
 * sempre tem o que mostrar.
 */
export async function getVehicleSelection(
  repository: VehicleRepository,
  ownerId: Id,
  requestedId: string | undefined,
): Promise<VehicleSelection> {
  const vehicles = await repository.list(ownerId);
  const selected = vehicles.find((vehicle) => vehicle.id === requestedId) ?? vehicles[0] ?? null;
  return { vehicles, selected };
}
