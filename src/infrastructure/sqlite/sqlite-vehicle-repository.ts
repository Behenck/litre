import type { VehicleRepository } from '@/application/ports/vehicle-repository';
import type { Id } from '@/domain/shared/id';
import { RepositoryError } from '@/domain/shared/result';
import type { Vehicle } from '@/domain/vehicle/vehicle';
import { getDatabase } from './connection';
import { ensureSchema } from './migrate';
import { rowToVehicle, type VehicleRow, vehicleToRow } from './mappers/vehicle-mapper';

const COLUMNS =
  'id, type, brand, model, year, plate, color, color_name, main_fuel, nickname, initial_odometer, created_at';

const UPSERT = `
  INSERT INTO vehicles (${COLUMNS})
  VALUES (@id, @type, @brand, @model, @year, @plate, @color, @color_name, @main_fuel, @nickname, @initial_odometer, @created_at)
  ON CONFLICT(id) DO UPDATE SET
    type = excluded.type, brand = excluded.brand, model = excluded.model, year = excluded.year,
    plate = excluded.plate, color = excluded.color, color_name = excluded.color_name,
    main_fuel = excluded.main_fuel, nickname = excluded.nickname,
    initial_odometer = excluded.initial_odometer
`;

export class SqliteVehicleRepository implements VehicleRepository {
  constructor() {
    ensureSchema();
  }

  async list(): Promise<Vehicle[]> {
    try {
      const rows = getDatabase()
        .prepare(`SELECT ${COLUMNS} FROM vehicles ORDER BY created_at ASC, model ASC`)
        .all() as VehicleRow[];
      return rows.map(rowToVehicle);
    } catch (cause) {
      throw new RepositoryError('Falha ao listar veículos.', cause);
    }
  }

  async findById(id: Id): Promise<Vehicle | null> {
    try {
      const row = getDatabase().prepare(`SELECT ${COLUMNS} FROM vehicles WHERE id = ?`).get(id) as
        | VehicleRow
        | undefined;
      return row ? rowToVehicle(row) : null;
    } catch (cause) {
      throw new RepositoryError('Falha ao buscar o veículo.', cause);
    }
  }

  async save(vehicle: Vehicle): Promise<void> {
    try {
      getDatabase().prepare(UPSERT).run(vehicleToRow(vehicle));
    } catch (cause) {
      throw new RepositoryError('Falha ao salvar o veículo.', cause);
    }
  }

  async delete(id: Id): Promise<void> {
    try {
      // ON DELETE CASCADE remove os abastecimentos (foreign_keys = ON).
      getDatabase().prepare('DELETE FROM vehicles WHERE id = ?').run(id);
    } catch (cause) {
      throw new RepositoryError('Falha ao excluir o veículo.', cause);
    }
  }

  async countFillUps(id: Id): Promise<number> {
    try {
      const row = getDatabase().prepare('SELECT COUNT(*) AS total FROM fill_ups WHERE vehicle_id = ?').get(id) as {
        total: number;
      };
      return row.total;
    } catch (cause) {
      throw new RepositoryError('Falha ao contar os abastecimentos do veículo.', cause);
    }
  }
}
