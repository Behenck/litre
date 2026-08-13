import { getDatabase } from './connection';
import { MIGRATIONS } from './migrations';

/**
 * Runner de migrações idempotente.
 *
 * Cada migração roda uma única vez, na ordem declarada, dentro de uma transação,
 * e fica registrada em `schema_migrations`.
 */
export function runMigrations(): string[] {
  const db = getDatabase();
  db.exec('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL)');

  const applied = new Set(
    db
      .prepare('SELECT name FROM schema_migrations')
      .all()
      .map((row) => (row as { name: string }).name),
  );

  const record = db.prepare('INSERT INTO schema_migrations (name, applied_at) VALUES (?, ?)');
  const pending = MIGRATIONS.filter((migration) => !applied.has(migration.name));

  for (const migration of pending) {
    db.transaction(() => {
      db.exec(migration.sql);
      record.run(migration.name, new Date().toISOString());
    })();
  }

  return pending.map((migration) => migration.name);
}

/**
 * Garante o schema antes do primeiro acesso em runtime, para que o app funcione
 * mesmo se `npm run db:migrate` não tiver sido executado.
 */
let ensured = false;
export function ensureSchema(): void {
  if (ensured) return;
  runMigrations();
  ensured = true;
}
