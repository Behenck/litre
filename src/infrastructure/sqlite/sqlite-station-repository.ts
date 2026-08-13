import type { StationRepository } from '@/application/ports/station-repository';
import type { Id } from '@/domain/shared/id';
import { RepositoryError } from '@/domain/shared/result';
import type { Station } from '@/domain/station/station';
import type { StationPriceEntry } from '@/domain/station/station-price-entry';
import { getDatabase } from './connection';
import { ensureSchema } from './migrate';
import {
  rowToStationPriceEntry,
  type StationPriceHistoryRow,
  stationPriceEntryToRow,
} from './mappers/station-price-history-mapper';
import { rowToStation, type StationRow, stationToRow } from './mappers/station-mapper';

const COLUMNS =
  'id, name, name_key, city, state, region_key, gasoline_cents, ethanol_cents, diesel_cents, price_date, updated_at, updated_by, updated_by_name';

const HISTORY_COLUMNS =
  'id, station_id, gasoline_cents, ethanol_cents, diesel_cents, price_date, recorded_by, recorded_by_name, recorded_at';

const INSERT_HISTORY = `
  INSERT INTO station_price_history (${HISTORY_COLUMNS})
  VALUES (@id, @station_id, @gasoline_cents, @ethanol_cents, @diesel_cents, @price_date, @recorded_by,
          @recorded_by_name, @recorded_at)
`;

/**
 * O conflito é resolvido por (`region_key`, `name_key`), não por id: anotar
 * "Shell Av. Brasil" de novo na mesma cidade atualiza os preços do posto que já
 * está lá (FR-028), inclusive quando quem anota é outro motorista.
 */
const UPSERT = `
  INSERT INTO stations (${COLUMNS})
  VALUES (@id, @name, @name_key, @city, @state, @region_key, @gasoline_cents, @ethanol_cents, @diesel_cents,
          @price_date, @updated_at, @updated_by, @updated_by_name)
  ON CONFLICT(region_key, name_key) DO UPDATE SET
    name = excluded.name, gasoline_cents = excluded.gasoline_cents,
    ethanol_cents = excluded.ethanol_cents, diesel_cents = excluded.diesel_cents,
    price_date = excluded.price_date, updated_at = excluded.updated_at, updated_by = excluded.updated_by,
    updated_by_name = excluded.updated_by_name
`;

export class SqliteStationRepository implements StationRepository {
  constructor() {
    ensureSchema();
  }

  async list(regionKey: string): Promise<Station[]> {
    try {
      const rows = getDatabase()
        .prepare(`SELECT ${COLUMNS} FROM stations WHERE region_key = ? ORDER BY updated_at DESC`)
        .all(regionKey) as StationRow[];
      return rows.map(rowToStation);
    } catch (cause) {
      throw new RepositoryError('Falha ao listar os postos.', cause);
    }
  }

  async findById(id: Id): Promise<Station | null> {
    try {
      const row = getDatabase().prepare(`SELECT ${COLUMNS} FROM stations WHERE id = ?`).get(id) as
        | StationRow
        | undefined;
      return row ? rowToStation(row) : null;
    } catch (cause) {
      throw new RepositoryError('Falha ao buscar o posto.', cause);
    }
  }

  async findByNameKey(regionKey: string, nameKey: string): Promise<Station | null> {
    try {
      const row = getDatabase()
        .prepare(`SELECT ${COLUMNS} FROM stations WHERE region_key = ? AND name_key = ?`)
        .get(regionKey, nameKey) as StationRow | undefined;
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

  async appendPriceHistory(entry: StationPriceEntry): Promise<void> {
    try {
      getDatabase().prepare(INSERT_HISTORY).run(stationPriceEntryToRow(entry));
    } catch (cause) {
      throw new RepositoryError('Falha ao registrar o histórico de preço.', cause);
    }
  }

  async listPriceHistory(stationId: Id): Promise<StationPriceEntry[]> {
    try {
      const rows = getDatabase()
        .prepare(
          `SELECT ${HISTORY_COLUMNS} FROM station_price_history
           WHERE station_id = ? ORDER BY price_date DESC, recorded_at DESC`,
        )
        .all(stationId) as StationPriceHistoryRow[];
      return rows.map(rowToStationPriceEntry);
    } catch (cause) {
      throw new RepositoryError('Falha ao listar o histórico de preço.', cause);
    }
  }
}
