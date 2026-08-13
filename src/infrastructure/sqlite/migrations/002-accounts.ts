/**
 * Migração de contas.
 *
 * Veículo e abastecimento passam a ter dono; posto passa a ter praça. As
 * colunas de dono entram com padrão vazio para que a migração rode num banco já
 * povoado — linha antiga fica sem dono e some das listas, que é o comportamento
 * correto depois que os dados viraram privados.
 *
 * `stations` é recriada em vez de alterada: a unicidade deixa de ser o nome e
 * passa a ser praça + nome, e SQLite não deixa remover o índice de um UNIQUE
 * declarado na coluna.
 *
 * O login em si (usuários e sessões) só existe no driver Supabase; aqui ficam
 * apenas as colunas de escopo, para que os dois adaptadores honrem o mesmo
 * contrato de repositório.
 */
export const migration002Accounts = {
  name: '002-accounts',
  sql: `
    ALTER TABLE vehicles ADD COLUMN user_id TEXT NOT NULL DEFAULT '';
    ALTER TABLE fill_ups ADD COLUMN user_id TEXT NOT NULL DEFAULT '';

    CREATE INDEX IF NOT EXISTS idx_vehicles_user ON vehicles(user_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_fill_ups_user ON fill_ups(user_id, vehicle_id, odometer);

    CREATE TABLE stations_nova (
      id               TEXT PRIMARY KEY,
      name             TEXT NOT NULL,
      name_key         TEXT NOT NULL,
      city             TEXT NOT NULL DEFAULT '',
      state            TEXT NOT NULL DEFAULT '',
      region_key       TEXT NOT NULL DEFAULT '',
      gasoline_cents   INTEGER,
      ethanol_cents    INTEGER,
      diesel_cents     INTEGER,
      updated_at       TEXT NOT NULL,
      updated_by       TEXT,
      updated_by_name  TEXT NOT NULL DEFAULT ''
    );

    INSERT INTO stations_nova (id, name, name_key, gasoline_cents, ethanol_cents, diesel_cents, updated_at)
      SELECT id, name, name_key, gasoline_cents, ethanol_cents, diesel_cents, updated_at FROM stations;

    DROP TABLE stations;
    ALTER TABLE stations_nova RENAME TO stations;

    CREATE UNIQUE INDEX IF NOT EXISTS idx_stations_region_name ON stations(region_key, name_key);
  `,
} as const;
