import type { FillUpRepository } from '@/application/ports/fill-up-repository';
import type { PreferencesStore } from '@/application/ports/preferences-store';
import type { SeedDataSource } from '@/application/ports/seed-data-source';
import type { StationRepository } from '@/application/ports/station-repository';
import type { VehicleRepository } from '@/application/ports/vehicle-repository';
import { CookiePreferencesStore } from './preferences/cookie-preferences-store';
import { SqliteFillUpRepository } from './sqlite/sqlite-fill-up-repository';
import { SqliteSeedDataSource } from './sqlite/sqlite-seed-data-source';
import { SqliteStationRepository } from './sqlite/sqlite-station-repository';
import { SqliteVehicleRepository } from './sqlite/sqlite-vehicle-repository';

/**
 * Composition root — o único lugar do sistema que conhece implementações concretas.
 *
 * Migrar para Supabase: criar `infrastructure/supabase/*`, acrescentar o caso
 * 'supabase' abaixo e definir LITRO_DB_DRIVER=supabase. Nenhuma outra camada muda.
 */

export interface Container {
  readonly vehicles: VehicleRepository;
  readonly fillUps: FillUpRepository;
  readonly stations: StationRepository;
  readonly preferences: PreferencesStore;
  readonly seed: SeedDataSource;
}

type Driver = 'sqlite' | 'supabase';

let container: Container | null = null;

function buildContainer(): Container {
  const driver = (process.env.LITRO_DB_DRIVER ?? 'sqlite') as Driver;

  switch (driver) {
    case 'sqlite':
      return {
        vehicles: new SqliteVehicleRepository(),
        fillUps: new SqliteFillUpRepository(),
        stations: new SqliteStationRepository(),
        preferences: new CookiePreferencesStore(),
        seed: new SqliteSeedDataSource(),
      };
    case 'supabase':
      throw new Error('O driver Supabase ainda não foi implementado. Use LITRO_DB_DRIVER=sqlite.');
    default:
      throw new Error(`Driver de banco desconhecido: ${String(driver)}`);
  }
}

export function getContainer(): Container {
  container ??= buildContainer();
  return container;
}
