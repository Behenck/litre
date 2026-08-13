import type { EmailVerification } from '@/domain/account/email-verification';
import type { Id } from '@/domain/shared/id';

/** Porta de persistência dos convites de confirmação de e-mail. */
export interface EmailVerificationRepository {
  findByTokenHash(tokenHash: string): Promise<EmailVerification | null>;
  save(verification: EmailVerification): Promise<void>;
  /** Descarta os convites do usuário: o token usado (ou reemitido) não volta a valer. */
  deleteByUser(userId: Id): Promise<void>;
}
