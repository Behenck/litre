import type { SeedDataSource } from '@/application/ports/seed-data-source';
import type { User } from '@/domain/account/user';
import { RepositoryError } from '@/domain/shared/result';
import { DEMO_FILL_UPS, DEMO_STATIONS, DEMO_VEHICLES, daysAgo, seedId } from '../seed/demo-data';
import { getSupabaseClient } from './client';
import type { Tables } from './database.types';

function vehiclesFor(user: User): Tables<'vehicles'>[] {
  return DEMO_VEHICLES.map((vehicle) => ({
    ...vehicle,
    id: seedId(vehicle.id, user.id),
    user_id: user.id,
  }));
}

function fillUpsFor(user: User): Tables<'fill_ups'>[] {
  return DEMO_FILL_UPS.map(([id, vehicleId, date, odometer, liters, total, stationName]) => ({
    id: seedId(id, user.id),
    user_id: user.id,
    vehicle_id: seedId(vehicleId, user.id),
    date,
    odometer,
    liters,
    total_cents: total,
    fuel: 'gasolina-comum',
    station_name: stationName,
    full_tank: true,
    created_at: date,
  }));
}

function stationsFor(user: User): Tables<'stations'>[] {
  return DEMO_STATIONS.map(([id, name, nameKey, gasoline, ethanol, diesel, days]) => ({
    id: seedId(id, user.id),
    name,
    name_key: nameKey,
    city: user.city,
    state: user.state,
    region_key: user.regionKey,
    gasoline_cents: gasoline,
    ethanol_cents: ethanol,
    diesel_cents: diesel,
    updated_at: daysAgo(days),
    updated_by: user.id,
    updated_by_name: user.name,
  }));
}

/**
 * Restaura o exemplo na conta do motorista.
 *
 * Veículos e abastecimentos dele são apagados e recriados; os postos entram na
 * praça dele por upsert, porque posto é dado coletivo — sobrescrever o preço
 * que outra pessoa anotou é o comportamento normal, apagar não seria.
 */
async function resetSeedData(user: User): Promise<void> {
  const supabase = getSupabaseClient();
  const operations = [
    () => supabase.from('fill_ups').delete().eq('user_id', user.id),
    () => supabase.from('vehicles').delete().eq('user_id', user.id),
    () => supabase.from('vehicles').insert(vehiclesFor(user)),
    () => supabase.from('fill_ups').insert(fillUpsFor(user)),
    () => supabase.from('stations').upsert(stationsFor(user), { onConflict: 'region_key, name_key' }),
  ];

  for (const operation of operations) {
    const { error } = await operation();
    if (error) throw error;
  }
}

export class SupabaseSeedDataSource implements SeedDataSource {
  async reset(user: User): Promise<void> {
    try {
      await resetSeedData(user);
    } catch (cause) {
      throw new RepositoryError('Falha ao restaurar os dados de exemplo.', cause);
    }
  }
}
