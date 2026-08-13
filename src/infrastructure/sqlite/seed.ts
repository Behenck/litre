import type { User } from '@/domain/account/user';
import { getDatabase } from './connection';
import { ensureSchema } from './migrate';
import { DEMO_FILL_UPS, DEMO_STATIONS, DEMO_VEHICLES, daysAgo, daysAgoDate, seedId } from '../seed/demo-data';

/**
 * Conjunto de demonstração, transposto do modelo de layout.
 *
 * Permite avaliar o app sem digitar nada. `resetSeedData` apaga os dados do
 * motorista antes de recarregar — é uma restauração, não um acréscimo. Os ids
 * levam o dono no sufixo para que duas contas possam ter o exemplo ao mesmo
 * tempo sem colidir.
 */
export function resetSeedData(user: User): void {
  ensureSchema();
  const db = getDatabase();

  db.transaction(() => {
    db.prepare('DELETE FROM fill_ups WHERE user_id = ?').run(user.id);
    db.prepare('DELETE FROM vehicles WHERE user_id = ?').run(user.id);

    const insertVehicle = db.prepare(`
      INSERT INTO vehicles (id, user_id, type, brand, model, year, plate, color, color_name, main_fuel, nickname, initial_odometer, created_at)
      VALUES (@id, @user_id, @type, @brand, @model, @year, @plate, @color, @color_name, @main_fuel, @nickname, @initial_odometer, @created_at)
    `);
    for (const vehicle of DEMO_VEHICLES) {
      insertVehicle.run({ ...vehicle, id: seedId(vehicle.id, user.id), user_id: user.id });
    }

    const insertFillUp = db.prepare(`
      INSERT INTO fill_ups (id, user_id, vehicle_id, date, odometer, liters, total_cents, fuel, station_name, full_tank, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'gasolina-comum', ?, 1, ?)
    `);
    for (const [id, vehicleId, date, odometer, liters, total, station] of DEMO_FILL_UPS) {
      insertFillUp.run(
        seedId(id, user.id),
        user.id,
        seedId(vehicleId, user.id),
        date,
        odometer,
        liters,
        total,
        station,
        date,
      );
    }

    // O posto é coletivo: entra na praça do motorista e atualiza o que já existe lá.
    const upsertStation = db.prepare(`
      INSERT INTO stations (id, name, name_key, city, state, region_key, gasoline_cents, ethanol_cents, diesel_cents, price_date, updated_at, updated_by, updated_by_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(region_key, name_key) DO UPDATE SET
        gasoline_cents = excluded.gasoline_cents, ethanol_cents = excluded.ethanol_cents,
        diesel_cents = excluded.diesel_cents, price_date = excluded.price_date,
        updated_at = excluded.updated_at, updated_by = excluded.updated_by, updated_by_name = excluded.updated_by_name
    `);
    for (const [id, name, key, gasoline, ethanol, diesel, days] of DEMO_STATIONS) {
      upsertStation.run(
        seedId(id, user.id),
        name,
        key,
        user.city,
        user.state,
        user.regionKey,
        gasoline,
        ethanol,
        diesel,
        daysAgoDate(days),
        daysAgo(days),
        user.id,
        user.name,
      );
    }
  })();
}
