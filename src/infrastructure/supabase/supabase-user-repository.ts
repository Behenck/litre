import type { UserRepository } from '@/application/ports/user-repository';
import type { User } from '@/domain/account/user';
import type { Id } from '@/domain/shared/id';
import { RepositoryError } from '@/domain/shared/result';
import { rowToUser, userToRow } from './account-mappers';
import { getSupabaseClient } from './client';

const COLUMNS = 'id, name, email, password_hash, city, state, region_key, email_verified_at, role, created_at';

export class SupabaseUserRepository implements UserRepository {
  async findById(id: Id): Promise<User | null> {
    try {
      const { data, error } = await getSupabaseClient().from('users').select(COLUMNS).eq('id', id).maybeSingle();
      if (error) throw error;
      return data ? rowToUser(data) : null;
    } catch (cause) {
      throw new RepositoryError('Falha ao buscar a conta.', cause);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await getSupabaseClient().from('users').select(COLUMNS).eq('email', email).maybeSingle();
      if (error) throw error;
      return data ? rowToUser(data) : null;
    } catch (cause) {
      throw new RepositoryError('Falha ao buscar a conta.', cause);
    }
  }

  async save(user: User): Promise<void> {
    try {
      const { error } = await getSupabaseClient().from('users').upsert(userToRow(user), { onConflict: 'id' });
      if (error) throw error;
    } catch (cause) {
      throw new RepositoryError('Falha ao salvar a conta.', cause);
    }
  }
}
