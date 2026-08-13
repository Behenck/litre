/**
 * Aplica as migrações pendentes. Idempotente: rodar duas vezes não faz nada.
 *
 * Uso: npm run db:migrate
 */
import { closeDatabase, databasePath } from '../src/infrastructure/sqlite/connection';
import { runMigrations } from '../src/infrastructure/sqlite/migrate';

const applied = runMigrations();

if (applied.length === 0) {
  console.log(`Banco já atualizado (${databasePath()}).`);
} else {
  console.log(`Migrações aplicadas em ${databasePath()}:`);
  for (const name of applied) console.log(`  • ${name}`);
}

closeDatabase();
