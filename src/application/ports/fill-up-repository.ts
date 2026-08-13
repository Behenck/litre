import type { FillUp } from '@/domain/fill-up/fill-up';
import type { Id } from '@/domain/shared/id';

/**
 * Porta de persistência de abastecimentos.
 *
 * Escopada pelo dono, como a de veículos: o histórico de consumo é privado.
 */
export interface FillUpRepository {
  /** Ordenado por odômetro ascendente — a ordem faz parte do contrato. */
  listByVehicle(ownerId: Id, vehicleId: Id): Promise<FillUp[]>;
  findLastByVehicle(ownerId: Id, vehicleId: Id): Promise<FillUp | null>;
  findById(ownerId: Id, id: Id): Promise<FillUp | null>;
  save(ownerId: Id, fillUp: FillUp): Promise<void>;
  delete(ownerId: Id, id: Id): Promise<void>;
  /** Nomes distintos de postos já usados pelo motorista, para sugestão no formulário. */
  listStationNames(ownerId: Id): Promise<string[]>;
}
