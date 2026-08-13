import type { Station } from '@/domain/station/station';
import type { Id } from '@/domain/shared/id';

/** Porta de persistência de postos. */
export interface StationRepository {
  /** Ordenado por `updatedAt` descendente. */
  list(): Promise<Station[]>;
  findByNameKey(nameKey: string): Promise<Station | null>;
  /** Upsert por `nameKey`: mesmo nome atualiza em vez de duplicar. */
  save(station: Station): Promise<void>;
  delete(id: Id): Promise<void>;
}
