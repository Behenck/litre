import { getDatabase } from './connection';
import { ensureSchema } from './migrate';

/**
 * Conjunto de demonstração, transposto do modelo de layout.
 *
 * Permite avaliar o app sem digitar nada. `resetSeedData` apaga tudo antes de
 * recarregar — é uma restauração, não um acréscimo.
 */

const VEHICLES = [
  {
    id: 'seed-v1',
    type: 'carro',
    brand: 'Honda',
    model: 'Civic EXL',
    year: 2019,
    plate: 'RTG4B21',
    color: '#B8BDC4',
    color_name: 'Prata',
    main_fuel: 'gasolina-comum',
    nickname: '',
    initial_odometer: 46_500,
    created_at: '2026-05-01',
  },
  {
    id: 'seed-v2',
    type: 'moto',
    brand: 'Honda',
    model: 'CG 160 Fan',
    year: 2022,
    plate: 'QNX7J09',
    color: '#C0392B',
    color_name: 'Vermelho',
    main_fuel: 'gasolina-comum',
    nickname: '',
    initial_odometer: 11_800,
    created_at: '2026-05-01',
  },
];

const FILL_UPS = [
  ['seed-f1', 'seed-v1', '2026-06-02', 47_010, 38.2, 24_135, 'Shell Av. Brasil'],
  ['seed-f2', 'seed-v1', '2026-06-19', 47_398, 32.4, 20_347, 'Ipiranga Centro'],
  ['seed-f3', 'seed-v1', '2026-07-05', 47_810, 35.1, 22_238, 'Shell Av. Brasil'],
  ['seed-f4', 'seed-v1', '2026-07-24', 48_210, 33.9, 21_357, 'Petrobras Rod. 040'],
  ['seed-f5', 'seed-v2', '2026-06-28', 12_080, 11.2, 7_034, 'Ipiranga Centro'],
  ['seed-f6', 'seed-v2', '2026-07-21', 12_440, 10.4, 6_530, 'Shell Av. Brasil'],
] as const;

const STATIONS = [
  ['seed-p1', 'Shell Av. Brasil', 'shell av. brasil', 629, 419, 589, 3],
  ['seed-p2', 'Ipiranga Centro', 'ipiranga centro', 609, 435, 579, 8],
  ['seed-p3', 'Petrobras Rod. 040', 'petrobras rod. 040', 619, 409, 599, 1],
] as const;

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

export function resetSeedData(): void {
  ensureSchema();
  const db = getDatabase();

  db.transaction(() => {
    db.exec('DELETE FROM fill_ups; DELETE FROM vehicles; DELETE FROM stations;');

    const insertVehicle = db.prepare(`
      INSERT INTO vehicles (id, type, brand, model, year, plate, color, color_name, main_fuel, nickname, initial_odometer, created_at)
      VALUES (@id, @type, @brand, @model, @year, @plate, @color, @color_name, @main_fuel, @nickname, @initial_odometer, @created_at)
    `);
    for (const vehicle of VEHICLES) insertVehicle.run(vehicle);

    const insertFillUp = db.prepare(`
      INSERT INTO fill_ups (id, vehicle_id, date, odometer, liters, total_cents, fuel, station_name, full_tank, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'gasolina-comum', ?, 1, ?)
    `);
    for (const [id, vehicleId, date, odometer, liters, total, station] of FILL_UPS) {
      insertFillUp.run(id, vehicleId, date, odometer, liters, total, station, date);
    }

    const insertStation = db.prepare(`
      INSERT INTO stations (id, name, name_key, gasoline_cents, ethanol_cents, diesel_cents, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const [id, name, key, gasoline, ethanol, diesel, days] of STATIONS) {
      insertStation.run(id, name, key, gasoline, ethanol, diesel, daysAgo(days));
    }
  })();
}
