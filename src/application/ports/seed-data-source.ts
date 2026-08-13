import type { User } from '@/domain/account/user';

/**
 * Porta de dados de demonstração.
 *
 * Escopada no motorista: restaurar recarrega os veículos e abastecimentos de
 * quem pediu, e os postos de exemplo na cidade dele — nunca mexe na conta
 * alheia.
 */
export interface SeedDataSource {
  /** Limpa os dados do usuário e recarrega o conjunto de demonstração. */
  reset(user: User): Promise<void>;
}
