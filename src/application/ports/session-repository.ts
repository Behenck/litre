import type { Session } from '@/domain/account/session';
import type { Id } from '@/domain/shared/id';

/** Porta de persistência de sessões de login. */
export interface SessionRepository {
  findById(id: Id): Promise<Session | null>;
  save(session: Session): Promise<void>;
  /** Encerra uma sessão. Id inexistente é no-op. */
  delete(id: Id): Promise<void>;
  /** Encerra todas as sessões do usuário — usado ao trocar a senha. */
  deleteByUser(userId: Id): Promise<void>;
}
