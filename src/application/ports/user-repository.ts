import type { User } from '@/domain/account/user';
import type { Id } from '@/domain/shared/id';

/** Porta de persistência de contas. */
export interface UserRepository {
  findById(id: Id): Promise<User | null>;
  /** Busca pelo e-mail já normalizado (`emailKey`). */
  findByEmail(email: string): Promise<User | null>;
  /** Insert ou update por id; idempotente para o mesmo estado. */
  save(user: User): Promise<void>;
}
