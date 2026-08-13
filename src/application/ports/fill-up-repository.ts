import type { FillUp } from '@/domain/fill-up/fill-up';
import type { Id } from '@/domain/shared/id';

/** Porta de persistência de abastecimentos. */
export interface FillUpRepository {
  /** Ordenado por odômetro ascendente — a ordem faz parte do contrato. */
  listByVehicle(vehicleId: Id): Promise<FillUp[]>;
  findLastByVehicle(vehicleId: Id): Promise<FillUp | null>;
  findById(id: Id): Promise<FillUp | null>;
  save(fillUp: FillUp): Promise<void>;
  delete(id: Id): Promise<void>;
  /** Nomes distintos de postos já usados, para sugestão no formulário. */
  listStationNames(): Promise<string[]>;
}
