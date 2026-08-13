import type { SeedDataSource } from '@/application/ports/seed-data-source';
import type { User } from '@/domain/account/user';
import { RepositoryError } from '@/domain/shared/result';
import { resetSeedData } from './seed';

export class SqliteSeedDataSource implements SeedDataSource {
  async reset(user: User): Promise<void> {
    try {
      resetSeedData(user);
    } catch (cause) {
      throw new RepositoryError('Falha ao restaurar os dados de exemplo.', cause);
    }
  }
}
