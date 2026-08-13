import type { Vehicle } from '@/domain/vehicle/vehicle';
import type { Id } from '@/domain/shared/id';

/**
 * Porta de persistência de veículos.
 *
 * Toda operação é escopada pelo dono: o veículo é privado do motorista que o
 * cadastrou, e o filtro por `ownerId` é parte do contrato — não uma cortesia da
 * camada de cima. Buscar id de outro usuário devolve `null`, não erro.
 *
 * Assíncrona por contrato mesmo com driver síncrono: é isso que torna o
 * adaptador Supabase aditivo, sem refatorar assinatura em nenhuma camada.
 */
export interface VehicleRepository {
  /** Ordenado por `createdAt` ascendente. */
  list(ownerId: Id): Promise<Vehicle[]>;
  findById(ownerId: Id, id: Id): Promise<Vehicle | null>;
  /** Insert ou update por id; idempotente para o mesmo estado. */
  save(ownerId: Id, vehicle: Vehicle): Promise<void>;
  /** Remove o veículo e seus abastecimentos. Id inexistente é no-op. */
  delete(ownerId: Id, id: Id): Promise<void>;
  countFillUps(ownerId: Id, id: Id): Promise<number>;
}
