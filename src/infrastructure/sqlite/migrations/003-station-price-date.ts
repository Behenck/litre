/**
 * Data do preço anotado no posto.
 *
 * `updated_at` é auditoria (quando o registro foi salvo); `price_date` é o dia
 * em que o motorista viu aquele preço, escolhido por ele no formulário. Para
 * registros já existentes, usamos a data de `updated_at` como melhor palpite.
 */
export const migration003StationPriceDate = {
  name: '003-station-price-date',
  sql: `
    ALTER TABLE stations ADD COLUMN price_date TEXT NOT NULL DEFAULT '';

    UPDATE stations SET price_date = substr(updated_at, 1, 10) WHERE price_date = '';
  `,
} as const;
