/**
 * Resultado explícito de operações de domínio.
 *
 * O domínio nunca lança exceções para erro de regra de negócio: retorna `Result`.
 * Isso obriga a camada de aplicação a tratar a falha e mantém o fluxo previsível.
 */

export type DomainErrorCode =
  | 'campo-obrigatorio'
  | 'valor-invalido'
  | 'fora-de-faixa'
  | 'data-futura'
  | 'odometro-nao-crescente'
  | 'nao-encontrado';

export interface DomainError {
  readonly code: DomainErrorCode;
  /** Campo ao qual o erro se refere, quando aplicável (alimenta `fieldErrors` na UI). */
  readonly field?: string;
  /** Mensagem já em português, pronta para o motorista ler. */
  readonly message: string;
}

export type Result<T> = { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: DomainError };

export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function fail<T = never>(code: DomainErrorCode, message: string, field?: string): Result<T> {
  return { ok: false, error: { code, message, field } };
}

/** Erro de infraestrutura traduzido: nenhum erro de driver escapa da camada de persistência. */
export class RepositoryError extends Error {
  constructor(
    message: string,
    override readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'RepositoryError';
  }
}
