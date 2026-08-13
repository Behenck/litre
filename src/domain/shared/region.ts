/**
 * Cidade e estado de quem dirige.
 *
 * A região é o que aproxima motoristas: o preço anotado num posto vale para
 * quem roda na mesma cidade. `key` é a forma normalizada usada tanto no
 * cadastro do usuário quanto na busca dos postos.
 */

import { normalizeKey } from './normalize';
import { fail, ok, type Result } from './result';

export const UFS = [
  { code: 'AC', name: 'Acre' },
  { code: 'AL', name: 'Alagoas' },
  { code: 'AP', name: 'Amapá' },
  { code: 'AM', name: 'Amazonas' },
  { code: 'BA', name: 'Bahia' },
  { code: 'CE', name: 'Ceará' },
  { code: 'DF', name: 'Distrito Federal' },
  { code: 'ES', name: 'Espírito Santo' },
  { code: 'GO', name: 'Goiás' },
  { code: 'MA', name: 'Maranhão' },
  { code: 'MT', name: 'Mato Grosso' },
  { code: 'MS', name: 'Mato Grosso do Sul' },
  { code: 'MG', name: 'Minas Gerais' },
  { code: 'PA', name: 'Pará' },
  { code: 'PB', name: 'Paraíba' },
  { code: 'PR', name: 'Paraná' },
  { code: 'PE', name: 'Pernambuco' },
  { code: 'PI', name: 'Piauí' },
  { code: 'RJ', name: 'Rio de Janeiro' },
  { code: 'RN', name: 'Rio Grande do Norte' },
  { code: 'RS', name: 'Rio Grande do Sul' },
  { code: 'RO', name: 'Rondônia' },
  { code: 'RR', name: 'Roraima' },
  { code: 'SC', name: 'Santa Catarina' },
  { code: 'SP', name: 'São Paulo' },
  { code: 'SE', name: 'Sergipe' },
  { code: 'TO', name: 'Tocantins' },
] as const;

export type Uf = (typeof UFS)[number]['code'];

export interface Region {
  readonly city: string;
  readonly state: Uf;
  /** `PR:curitiba` — o que agrupa os postos de uma mesma praça. */
  readonly key: string;
}

const MIN_CITY = 2;
const MAX_CITY = 60;

export function isUf(value: string): value is Uf {
  return UFS.some((uf) => uf.code === value);
}

export function regionKey(city: string, state: Uf): string {
  return `${state}:${normalizeKey(city)}`;
}

export function createRegion(city: string, state: string): Result<Region> {
  const trimmed = city.trim().replace(/\s+/g, ' ');
  if (trimmed === '') {
    return fail('campo-obrigatorio', 'Informe a cidade onde você dirige.', 'city');
  }
  if (trimmed.length < MIN_CITY || trimmed.length > MAX_CITY) {
    return fail('fora-de-faixa', `A cidade deve ter entre ${MIN_CITY} e ${MAX_CITY} caracteres.`, 'city');
  }

  const uf = state.trim().toUpperCase();
  if (uf === '') {
    return fail('campo-obrigatorio', 'Escolha o estado.', 'state');
  }
  if (!isUf(uf)) {
    return fail('valor-invalido', 'Escolha um estado válido.', 'state');
  }

  return ok({ city: trimmed, state: uf, key: regionKey(trimmed, uf) });
}

/** "Curitiba — PR", como o motorista lê na tela. */
export function formatRegion(region: { readonly city: string; readonly state: string }): string {
  return `${region.city} — ${region.state}`;
}
