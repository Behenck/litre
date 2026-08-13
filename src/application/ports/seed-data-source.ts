/**
 * Porta de dados de demonstração.
 *
 * Existe como porta (e não como import direto do adaptador) para que a UI não
 * conheça o driver: a versão Supabase implementará a mesma interface.
 */
export interface SeedDataSource {
  /** Limpa os dados atuais e recarrega o conjunto de demonstração. */
  reset(): Promise<void>;
}
