import type { Vehicle } from '@/domain/vehicle/vehicle';
import type { Id } from '@/domain/shared/id';

/**
 * Porta de persistência de veículos.
 *
 * Assíncrona por contrato mesmo com driver síncrono: é isso que torna o
 * adaptador Supabase aditivo, sem refatorar assinatura em nenhuma camada.
 */
export interface VehicleRepository {
  /** Ordenado por `createdAt` ascendente. */
  list(): Promise<Vehicle[]>;
  findById(id: Id): Promise<Vehicle | null>;
  /** Insert ou update por id; idempotente para o mesmo estado. */
  save(vehicle: Vehicle): Promise<void>;
  /** Remove o veículo e seus abastecimentos. Id inexistente é no-op. */
  delete(id: Id): Promise<void>;
  countFillUps(id: Id): Promise<number>;
}
