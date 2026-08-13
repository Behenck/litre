import type { FillUpRepository } from '@/application/ports/fill-up-repository';
import type { FillUp } from '@/domain/fill-up/fill-up';
import type { Id } from '@/domain/shared/id';
import { RepositoryError } from '@/domain/shared/result';
import { getDatabase } from './connection';
import { ensureSchema } from './migrate';
import { fillUpToRow, type FillUpRow, rowToFillUp } from './mappers/fill-up-mapper';

const COLUMNS =
  'id, user_id, vehicle_id, date, odometer, liters, total_cents, fuel, station_name, full_tank, created_at';

const UPSERT = `
  INSERT INTO fill_ups (${COLUMNS})
  VALUES (@id, @user_id, @vehicle_id, @date, @odometer, @liters, @total_cents, @fuel, @station_name, @full_tank, @created_at)
  ON CONFLICT(id) DO UPDATE SET
    vehicle_id = excluded.vehicle_id, date = excluded.date, odometer = excluded.odometer,
    liters = excluded.liters, total_cents = excluded.total_cents, fuel = excluded.fuel,
    station_name = excluded.station_name, full_tank = excluded.full_tank
  WHERE fill_ups.user_id = excluded.user_id
`;

export class SqliteFillUpRepository implements FillUpRepository {
  constructor() {
    ensureSchema();
  }

  async listByVehicle(ownerId: Id, vehicleId: Id): Promise<FillUp[]> {
    try {
      const rows = getDatabase()
        .prepare(
          `SELECT ${COLUMNS} FROM fill_ups WHERE user_id = ? AND vehicle_id = ? ORDER BY odometer ASC, date ASC`,
        )
        .all(ownerId, vehicleId) as FillUpRow[];
      return rows.map(rowToFillUp);
    } catch (cause) {
      throw new RepositoryError('Falha ao listar os abastecimentos.', cause);
    }
  }

  async findLastByVehicle(ownerId: Id, vehicleId: Id): Promise<FillUp | null> {
    try {
      const row = getDatabase()
        .prepare(`SELECT ${COLUMNS} FROM fill_ups WHERE user_id = ? AND vehicle_id = ? ORDER BY odometer DESC LIMIT 1`)
        .get(ownerId, vehicleId) as FillUpRow | undefined;
      return row ? rowToFillUp(row) : null;
    } catch (cause) {
      throw new RepositoryError('Falha ao buscar o último abastecimento.', cause);
    }
  }

  async findById(ownerId: Id, id: Id): Promise<FillUp | null> {
    try {
      const row = getDatabase()
        .prepare(`SELECT ${COLUMNS} FROM fill_ups WHERE user_id = ? AND id = ?`)
        .get(ownerId, id) as FillUpRow | undefined;
      return row ? rowToFillUp(row) : null;
    } catch (cause) {
      throw new RepositoryError('Falha ao buscar o abastecimento.', cause);
    }
  }

  async save(ownerId: Id, fillUp: FillUp): Promise<void> {
    try {
      getDatabase().prepare(UPSERT).run(fillUpToRow(ownerId, fillUp));
    } catch (cause) {
      throw new RepositoryError('Falha ao salvar o abastecimento.', cause);
    }
  }

  async delete(ownerId: Id, id: Id): Promise<void> {
    try {
      getDatabase().prepare('DELETE FROM fill_ups WHERE user_id = ? AND id = ?').run(ownerId, id);
    } catch (cause) {
      throw new RepositoryError('Falha ao excluir o abastecimento.', cause);
    }
  }

  async listStationNames(ownerId: Id): Promise<string[]> {
    try {
      const rows = getDatabase()
        .prepare(
          "SELECT DISTINCT station_name FROM fill_ups WHERE user_id = ? AND station_name <> '' ORDER BY station_name ASC",
        )
        .all(ownerId) as { station_name: string }[];
      return rows.map((row) => row.station_name);
    } catch (cause) {
      throw new RepositoryError('Falha ao listar os postos usados.', cause);
    }
  }
}
