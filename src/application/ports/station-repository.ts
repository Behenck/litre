import type { Station } from '@/domain/station/station';
import type { Id } from '@/domain/shared/id';

/**
 * Porta de persistência de postos.
 *
 * Diferente de veículos e abastecimentos, o posto é compartilhado: o escopo não
 * é o usuário, é a praça (`regionKey`). Quem dirige na mesma cidade vê — e
 * atualiza — os mesmos preços.
 */
export interface StationRepository {
  /** Postos da praça, ordenados por `updatedAt` descendente. */
  list(regionKey: string): Promise<Station[]>;
  findById(id: Id): Promise<Station | null>;
  /** Upsert por (`regionKey`, `nameKey`): mesmo nome na mesma cidade atualiza. */
  findByNameKey(regionKey: string, nameKey: string): Promise<Station | null>;
  save(station: Station): Promise<void>;
  delete(id: Id): Promise<void>;
}
