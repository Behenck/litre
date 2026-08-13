import type { StationRepository } from '@/application/ports/station-repository';
import type { Id } from '@/domain/shared/id';
import { RepositoryError } from '@/domain/shared/result';
import type { Station } from '@/domain/station/station';
import { getSupabaseClient } from './client';
import { rowToStation, stationToRow } from './mappers';

const COLUMNS =
  'id, name, name_key, city, state, region_key, gasoline_cents, ethanol_cents, diesel_cents, updated_at, updated_by, updated_by_name';

/**
 * O posto é o único dado coletivo do app: o escopo das consultas é a praça
 * (`region_key`), não o usuário. Quem dirige na mesma cidade lê e escreve os
 * mesmos preços.
 */
export class SupabaseStationRepository implements StationRepository {
  async list(regionKey: string): Promise<Station[]> {
    try {
      const { data, error } = await getSupabaseClient()
        .from('stations')
        .select(COLUMNS)
        .eq('region_key', regionKey)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data.map(rowToStation);
    } catch (cause) {
      throw new RepositoryError('Falha ao listar os postos.', cause);
    }
  }

  async findById(id: Id): Promise<Station | null> {
    try {
      const { data, error } = await getSupabaseClient().from('stations').select(COLUMNS).eq('id', id).maybeSingle();
      if (error) throw error;
      return data ? rowToStation(data) : null;
    } catch (cause) {
      throw new RepositoryError('Falha ao buscar o posto.', cause);
    }
  }

  async findByNameKey(regionKey: string, nameKey: string): Promise<Station | null> {
    try {
      const { data, error } = await getSupabaseClient()
        .from('stations')
        .select(COLUMNS)
        .eq('region_key', regionKey)
        .eq('name_key', nameKey)
        .maybeSingle();
      if (error) throw error;
      return data ? rowToStation(data) : null;
    } catch (cause) {
      throw new RepositoryError('Falha ao buscar o posto.', cause);
    }
  }

  async save(station: Station): Promise<void> {
    try {
      const { error } = await getSupabaseClient()
        .from('stations')
        .upsert(stationToRow(station), { onConflict: 'region_key, name_key' });
      if (error) throw error;
    } catch (cause) {
      throw new RepositoryError('Falha ao salvar o posto.', cause);
    }
  }

  async delete(id: Id): Promise<void> {
    try {
      const { error } = await getSupabaseClient().from('stations').delete().eq('id', id);
      if (error) throw error;
    } catch (cause) {
      throw new RepositoryError('Falha ao excluir o posto.', cause);
    }
  }
}
