/**
 * Restaura o conjunto de demonstração.
 *
 * ATENÇÃO: apaga veículos, abastecimentos e postos existentes.
 *
 * Uso: npm run db:seed
 */
import { closeDatabase, databasePath } from '../src/infrastructure/sqlite/connection';
import { resetSeedData } from '../src/infrastructure/sqlite/seed';

resetSeedData();
console.log(`Dados de exemplo restaurados em ${databasePath()}.`);

closeDatabase();
