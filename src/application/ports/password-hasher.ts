/**
 * Porta de hash de senha.
 *
 * A aplicação nunca compara senha com `===`: quem sabe o algoritmo, o custo e a
 * comparação em tempo constante é o adaptador.
 */
export interface PasswordHasher {
  hash(password: string): Promise<string>;
  /** `false` para senha errada; nunca lança por hash malformado. */
  verify(password: string, hash: string): Promise<boolean>;
}
