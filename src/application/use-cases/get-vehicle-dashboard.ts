import type { FillUpRepository } from '../ports/fill-up-repository';
import type { FillUp } from '@/domain/fill-up/fill-up';
import type { Id } from '@/domain/shared/id';
import { computeVehicleStats, type VehicleStats } from '@/domain/analytics/vehicle-stats';

export interface VehicleDashboard {
  readonly stats: VehicleStats;
  /** Abastecimentos do mais recente para o mais antigo. */
  readonly recent: FillUp[];
  readonly all: FillUp[];
}

/**
 * Reúne tudo que o painel precisa em uma leitura só, para a página não
 * disparar consultas espalhadas.
 */
export async function getVehicleDashboard(
  repository: FillUpRepository,
  vehicleId: Id,
  recentLimit = 4,
): Promise<VehicleDashboard> {
  const all = await repository.listByVehicle(vehicleId);
  const newestFirst = [...all].reverse();

  return {
    stats: computeVehicleStats(all),
    recent: newestFirst.slice(0, recentLimit),
    all: newestFirst,
  };
}
