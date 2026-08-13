/**
 * Migração inicial.
 *
 * Os tipos usados (TEXT, INTEGER, REAL) têm equivalente direto em Postgres,
 * para que a tradução ao migrar para Supabase seja mecânica.
 */
export const migration001Initial = {
  name: '001-initial',
  sql: `
    CREATE TABLE IF NOT EXISTS vehicles (
      id                TEXT PRIMARY KEY,
      type              TEXT NOT NULL,
      brand             TEXT NOT NULL DEFAULT '',
      model             TEXT NOT NULL,
      year              INTEGER,
      plate             TEXT NOT NULL DEFAULT '',
      color             TEXT NOT NULL,
      color_name        TEXT NOT NULL,
      main_fuel         TEXT NOT NULL,
      nickname          TEXT NOT NULL DEFAULT '',
      initial_odometer  REAL NOT NULL DEFAULT 0,
      created_at        TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS fill_ups (
      id            TEXT PRIMARY KEY,
      vehicle_id    TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
      date          TEXT NOT NULL,
      odometer      REAL NOT NULL,
      liters        REAL NOT NULL,
      total_cents   INTEGER NOT NULL,
      fuel          TEXT NOT NULL,
      station_name  TEXT NOT NULL DEFAULT '',
      full_tank     INTEGER NOT NULL DEFAULT 1,
      created_at    TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_fill_ups_vehicle ON fill_ups(vehicle_id, odometer);

    CREATE TABLE IF NOT EXISTS stations (
      id              TEXT PRIMARY KEY,
      name            TEXT NOT NULL,
      name_key        TEXT NOT NULL UNIQUE,
      gasoline_cents  INTEGER,
      ethanol_cents   INTEGER,
      diesel_cents    INTEGER,
      updated_at      TEXT NOT NULL
    );
  `,
} as const;
