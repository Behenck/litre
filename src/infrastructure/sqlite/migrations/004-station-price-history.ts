/**
 * Histórico de preços por posto.
 *
 * `stations` continua guardando só o preço atual (upsert); esta tabela é
 * append-only — uma linha por anotação, nunca editada nem removida — para dar
 * a evolução do preço ao longo do tempo.
 */
export const migration004StationPriceHistory = {
  name: '004-station-price-history',
  sql: `
    CREATE TABLE IF NOT EXISTS station_price_history (
      id                TEXT PRIMARY KEY,
      station_id        TEXT NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
      gasoline_cents    INTEGER,
      ethanol_cents     INTEGER,
      diesel_cents      INTEGER,
      price_date        TEXT NOT NULL,
      recorded_by       TEXT,
      recorded_by_name  TEXT NOT NULL DEFAULT '',
      recorded_at       TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_station_price_history_station
      ON station_price_history(station_id, price_date DESC, recorded_at DESC);
  `,
} as const;
