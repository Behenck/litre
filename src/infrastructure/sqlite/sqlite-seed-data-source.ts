import type { SeedDataSource } from '@/application/ports/seed-data-source';
import { RepositoryError } from '@/domain/shared/result';
import { resetSeedData } from './seed';

export class SqliteSeedDataSource implements SeedDataSource {
  async reset(): Promise<void> {
    try {
      resetSeedData();
    } catch (cause) {
      throw new RepositoryError('Falha ao restaurar os dados de exemplo.', cause);
    }
  }
}
