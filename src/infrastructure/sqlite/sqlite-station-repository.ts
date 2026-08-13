import type { StationRepository } from '@/application/ports/station-repository';
import type { Id } from '@/domain/shared/id';
import { RepositoryError } from '@/domain/shared/result';
import type { Station } from '@/domain/station/station';
import { getDatabase } from './connection';
import { ensureSchema } from './migrate';
import { rowToStation, type StationRow, stationToRow } from './mappers/station-mapper';

const COLUMNS = 'id, name, name_key, gasoline_cents, ethanol_cents, diesel_cents, updated_at';

/**
 * O conflito é resolvido por `name_key`, não por id: salvar "Shell Av. Brasil"
 * de novo atualiza os preços do posto existente (FR-028).
 */
const UPSERT = `
  INSERT INTO stations (${COLUMNS})
  VALUES (@id, @name, @name_key, @gasoline_cents, @ethanol_cents, @diesel_cents, @updated_at)
  ON CONFLICT(name_key) DO UPDATE SET
    name = excluded.name, gasoline_cents = excluded.gasoline_cents,
    ethanol_cents = excluded.ethanol_cents, diesel_cents = excluded.diesel_cents,
    updated_at = excluded.updated_at
`;

export class SqliteStationRepository implements StationRepository {
  constructor() {
    ensureSchema();
  }

  async list(): Promise<Station[]> {
    try {
      const rows = getDatabase()
        .prepare(`SELECT ${COLUMNS} FROM stations ORDER BY updated_at DESC`)
        .all() as StationRow[];
      return rows.map(rowToStation);
    } catch (cause) {
      throw new RepositoryError('Falha ao listar os postos.', cause);
    }
  }

  async findByNameKey(nameKey: string): Promise<Station | null> {
    try {
      const row = getDatabase().prepare(`SELECT ${COLUMNS} FROM stations WHERE name_key = ?`).get(nameKey) as
        | StationRow
        | undefined;
      return row ? rowToStation(row) : null;
    } catch (cause) {
      throw new RepositoryError('Falha ao buscar o posto.', cause);
    }
  }

  async save(station: Station): Promise<void> {
    try {
      getDatabase().prepare(UPSERT).run(stationToRow(station));
    } catch (cause) {
      throw new RepositoryError('Falha ao salvar o posto.', cause);
    }
  }

  async delete(id: Id): Promise<void> {
    try {
      getDatabase().prepare('DELETE FROM stations WHERE id = ?').run(id);
    } catch (cause) {
      throw new RepositoryError('Falha ao excluir o posto.', cause);
    }
  }
}
