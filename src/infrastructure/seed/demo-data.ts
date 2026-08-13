/**
 * Conjunto de demonstração, transposto do modelo de layout.
 *
 * Fica fora dos dois drivers porque o dado é o mesmo: só a forma de gravar
 * muda. Os ids ganham o sufixo do dono (`seedId`) para que duas contas possam
 * carregar o exemplo ao mesmo tempo sem colidir.
 */

import { toIsoDate } from '@/domain/shared/iso-date';

export const DEMO_VEHICLES = [
  {
    id: 'seed-v1',
    type: 'carro',
    brand: 'Honda',
    model: 'Civic EXL',
    year: 2019,
    plate: 'RTG4B21',
    color: '#B8BDC4',
    color_name: 'Prata',
    main_fuel: 'gasolina-comum',
    nickname: '',
    initial_odometer: 46_500,
    created_at: '2026-05-01',
  },
  {
    id: 'seed-v2',
    type: 'moto',
    brand: 'Honda',
    model: 'CG 160 Fan',
    year: 2022,
    plate: 'QNX7J09',
    color: '#C0392B',
    color_name: 'Vermelho',
    main_fuel: 'gasolina-comum',
    nickname: '',
    initial_odometer: 11_800,
    created_at: '2026-05-01',
  },
] as const;

export const DEMO_FILL_UPS = [
  ['seed-f1', 'seed-v1', '2026-06-02', 47_010, 38.2, 24_135, 'Shell Av. Brasil'],
  ['seed-f2', 'seed-v1', '2026-06-19', 47_398, 32.4, 20_347, 'Ipiranga Centro'],
  ['seed-f3', 'seed-v1', '2026-07-05', 47_810, 35.1, 22_238, 'Shell Av. Brasil'],
  ['seed-f4', 'seed-v1', '2026-07-24', 48_210, 33.9, 21_357, 'Petrobras Rod. 040'],
  ['seed-f5', 'seed-v2', '2026-06-28', 12_080, 11.2, 7_034, 'Ipiranga Centro'],
  ['seed-f6', 'seed-v2', '2026-07-21', 12_440, 10.4, 6_530, 'Shell Av. Brasil'],
] as const;

export const DEMO_STATIONS = [
  ['seed-p1', 'Shell Av. Brasil', 'shell av. brasil', 629, 419, 589, 3],
  ['seed-p2', 'Ipiranga Centro', 'ipiranga centro', 609, 435, 579, 8],
  ['seed-p3', 'Petrobras Rod. 040', 'petrobras rod. 040', 619, 409, 599, 1],
] as const;

export function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

/** Mesmo intervalo de `daysAgo`, mas como `IsoDate` (`YYYY-MM-DD`), para `price_date`. */
export function daysAgoDate(days: number): string {
  return toIsoDate(new Date(Date.now() - days * 86_400_000));
}

/** Id do exemplo dentro da conta: previsível, para restaurar sobrescrever o anterior. */
export function seedId(id: string, ownerId: string): string {
  return `${id}-${ownerId}`;
}
