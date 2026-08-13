/**
 * Criador do posto.
 *
 * `updated_by` é sobrescrito a cada anotação de preço, então não dá para usá-lo
 * para saber quem pode apagar o posto. `created_by` entra separado e nunca é
 * trocado depois de gravado. Para posto já existente não há como saber quem
 * criou de fato — o melhor palpite é quem fez a última anotação até aqui.
 */
export const migration005StationCreator = {
  name: '005-station-creator',
  sql: `
    ALTER TABLE stations ADD COLUMN created_by TEXT;
    ALTER TABLE stations ADD COLUMN created_by_name TEXT NOT NULL DEFAULT '';

    UPDATE stations SET created_by = updated_by, created_by_name = updated_by_name;
  `,
} as const;
