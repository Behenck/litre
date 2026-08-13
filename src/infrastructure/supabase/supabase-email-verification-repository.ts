import type { EmailVerificationRepository } from '@/application/ports/email-verification-repository';
import type { EmailVerification } from '@/domain/account/email-verification';
import type { Id } from '@/domain/shared/id';
import { RepositoryError } from '@/domain/shared/result';
import { rowToVerification, verificationToRow } from './account-mappers';
import { getSupabaseClient } from './client';

const COLUMNS = 'token_hash, user_id, expires_at, created_at';

export class SupabaseEmailVerificationRepository implements EmailVerificationRepository {
  async findByTokenHash(tokenHash: string): Promise<EmailVerification | null> {
    try {
      const { data, error } = await getSupabaseClient()
        .from('email_verifications')
        .select(COLUMNS)
        .eq('token_hash', tokenHash)
        .maybeSingle();
      if (error) throw error;
      return data ? rowToVerification(data) : null;
    } catch (cause) {
      throw new RepositoryError('Falha ao conferir o link de confirmação.', cause);
    }
  }

  async save(verification: EmailVerification): Promise<void> {
    try {
      const { error } = await getSupabaseClient()
        .from('email_verifications')
        .upsert(verificationToRow(verification), { onConflict: 'token_hash' });
      if (error) throw error;
    } catch (cause) {
      throw new RepositoryError('Falha ao registrar a confirmação de e-mail.', cause);
    }
  }

  async deleteByUser(userId: Id): Promise<void> {
    try {
      const { error } = await getSupabaseClient().from('email_verifications').delete().eq('user_id', userId);
      if (error) throw error;
    } catch (cause) {
      throw new RepositoryError('Falha ao descartar os links de confirmação.', cause);
    }
  }
}
