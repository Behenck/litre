import type { EmailVerificationRepository } from '@/application/ports/email-verification-repository';
import type { SessionRepository } from '@/application/ports/session-repository';
import type { UserRepository } from '@/application/ports/user-repository';
import { RepositoryError } from '@/domain/shared/result';

/**
 * Contas não existem no driver SQLite.
 *
 * O driver local guarda veículos, abastecimentos e postos; login, sessão e
 * confirmação de e-mail só no Supabase. Em vez de devolver `null` e deixar o
 * app achar que ninguém está logado, cada método falha dizendo o que fazer —
 * é o que o Princípio II (LSP) exige de um adaptador incompleto: falhar
 * explicitamente, nunca em silêncio.
 */

function unsupported(): never {
  throw new RepositoryError(
    'O driver SQLite não guarda contas. Use LITRO_DB_DRIVER=supabase para entrar, cadastrar ou confirmar e-mail.',
  );
}

export class UnsupportedUserRepository implements UserRepository {
  async findById(): Promise<never> {
    return unsupported();
  }
  async findByEmail(): Promise<never> {
    return unsupported();
  }
  async save(): Promise<never> {
    return unsupported();
  }
}

export class UnsupportedSessionRepository implements SessionRepository {
  async findById(): Promise<never> {
    return unsupported();
  }
  async save(): Promise<never> {
    return unsupported();
  }
  async delete(): Promise<never> {
    return unsupported();
  }
  async deleteByUser(): Promise<never> {
    return unsupported();
  }
}

export class UnsupportedEmailVerificationRepository implements EmailVerificationRepository {
  async findByTokenHash(): Promise<never> {
    return unsupported();
  }
  async save(): Promise<never> {
    return unsupported();
  }
  async deleteByUser(): Promise<never> {
    return unsupported();
  }
}
