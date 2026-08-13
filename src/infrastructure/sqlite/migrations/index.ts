import { migration001Initial } from './001-initial';
import { migration002Accounts } from './002-accounts';
import { migration003StationPriceDate } from './003-station-price-date';
import { migration004StationPriceHistory } from './004-station-price-history';
import { migration005StationCreator } from './005-station-creator';

export interface Migration {
  readonly name: string;
  readonly sql: string;
}

/** Ordem de aplicação. Novas migrações são acrescentadas ao fim, nunca no meio. */
export const MIGRATIONS: readonly Migration[] = [
  migration001Initial,
  migration002Accounts,
  migration003StationPriceDate,
  migration004StationPriceHistory,
  migration005StationCreator,
];
