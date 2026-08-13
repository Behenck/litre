import type { PasswordReset } from '@/domain/account/password-reset';
import type { Id } from '@/domain/shared/id';

/** Porta de persistência dos convites de redefinição de senha. */
export interface PasswordResetRepository {
  findByTokenHash(tokenHash: string): Promise<PasswordReset | null>;
  save(reset: PasswordReset): Promise<void>;
  /** Descarta os convites do usuário: o token usado (ou reemitido) não volta a valer. */
  deleteByUser(userId: Id): Promise<void>;
}
