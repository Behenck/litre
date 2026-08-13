import { migration001Initial } from './001-initial';

export interface Migration {
  readonly name: string;
  readonly sql: string;
}

/** Ordem de aplicação. Novas migrações são acrescentadas ao fim, nunca no meio. */
export const MIGRATIONS: readonly Migration[] = [migration001Initial];
