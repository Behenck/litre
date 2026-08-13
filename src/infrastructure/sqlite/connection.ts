import { mkdirSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';
import Database from 'better-sqlite3';

/**
 * Conexão única por processo com o arquivo SQLite.
 *
 * `better-sqlite3` é síncrono, o que torna a leitura dentro de Server Components
 * trivial. A natureza síncrona não vaza: as portas de repositório são assíncronas.
 */

let instance: Database.Database | null = null;

export function databasePath(): string {
  const configured = process.env.LITRO_DB_PATH ?? 'data/litro.db';
  // O caminho vem de variável de ambiente, então o bundler não consegue analisá-lo
  // estaticamente; sem o ignore ele traça o projeto inteiro para dentro do build.
  return isAbsolute(configured) ? configured : resolve(/*turbopackIgnore: true*/ process.cwd(), configured);
}

export function getDatabase(): Database.Database {
  if (instance) return instance;

  const path = databasePath();
  mkdirSync(dirname(path), { recursive: true });

  const db = new Database(path);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  instance = db;
  return db;
}

/** Fecha a conexão — usado pelos scripts de linha de comando. */
export function closeDatabase(): void {
  instance?.close();
  instance = null;
}
