import type { PasswordResetRepository } from '@/application/ports/password-reset-repository';
import type { PasswordReset } from '@/domain/account/password-reset';
import type { Id } from '@/domain/shared/id';
import { RepositoryError } from '@/domain/shared/result';
import { passwordResetToRow, rowToPasswordReset } from './account-mappers';
import { getSupabaseClient } from './client';

const COLUMNS = 'token_hash, user_id, expires_at, created_at';

export class SupabasePasswordResetRepository implements PasswordResetRepository {
  async findByTokenHash(tokenHash: string): Promise<PasswordReset | null> {
    try {
      const { data, error } = await getSupabaseClient()
        .from('password_resets')
        .select(COLUMNS)
        .eq('token_hash', tokenHash)
        .maybeSingle();
      if (error) throw error;
      return data ? rowToPasswordReset(data) : null;
    } catch (cause) {
      throw new RepositoryError('Falha ao conferir o link de redefinição.', cause);
    }
  }

  async save(reset: PasswordReset): Promise<void> {
    try {
      const { error } = await getSupabaseClient()
        .from('password_resets')
        .upsert(passwordResetToRow(reset), { onConflict: 'token_hash' });
      if (error) throw error;
    } catch (cause) {
      throw new RepositoryError('Falha ao registrar a redefinição de senha.', cause);
    }
  }

  async deleteByUser(userId: Id): Promise<void> {
    try {
      const { error } = await getSupabaseClient().from('password_resets').delete().eq('user_id', userId);
      if (error) throw error;
    } catch (cause) {
      throw new RepositoryError('Falha ao descartar os links de redefinição.', cause);
    }
  }
}
