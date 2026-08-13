import type { SessionRepository } from '@/application/ports/session-repository';
import type { Session } from '@/domain/account/session';
import type { Id } from '@/domain/shared/id';
import { RepositoryError } from '@/domain/shared/result';
import { rowToSession, sessionToRow } from './account-mappers';
import { getSupabaseClient } from './client';

const COLUMNS = 'id, user_id, token_hash, expires_at, created_at';

export class SupabaseSessionRepository implements SessionRepository {
  async findById(id: Id): Promise<Session | null> {
    try {
      const { data, error } = await getSupabaseClient().from('sessions').select(COLUMNS).eq('id', id).maybeSingle();
      if (error) throw error;
      return data ? rowToSession(data) : null;
    } catch (cause) {
      throw new RepositoryError('Falha ao ler a sessão.', cause);
    }
  }

  async save(session: Session): Promise<void> {
    try {
      const { error } = await getSupabaseClient().from('sessions').upsert(sessionToRow(session), { onConflict: 'id' });
      if (error) throw error;
    } catch (cause) {
      throw new RepositoryError('Falha ao abrir a sessão.', cause);
    }
  }

  async delete(id: Id): Promise<void> {
    try {
      const { error } = await getSupabaseClient().from('sessions').delete().eq('id', id);
      if (error) throw error;
    } catch (cause) {
      throw new RepositoryError('Falha ao encerrar a sessão.', cause);
    }
  }

  async deleteByUser(userId: Id): Promise<void> {
    try {
      const { error } = await getSupabaseClient().from('sessions').delete().eq('user_id', userId);
      if (error) throw error;
    } catch (cause) {
      throw new RepositoryError('Falha ao encerrar as sessões da conta.', cause);
    }
  }
}
