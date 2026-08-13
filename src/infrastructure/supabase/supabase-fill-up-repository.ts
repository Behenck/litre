import type { FillUpRepository } from '@/application/ports/fill-up-repository';
import type { FillUp } from '@/domain/fill-up/fill-up';
import type { Id } from '@/domain/shared/id';
import { RepositoryError } from '@/domain/shared/result';
import { getSupabaseClient } from './client';
import { fillUpToRow, rowToFillUp } from './mappers';

const COLUMNS =
  'id, user_id, vehicle_id, date, odometer, liters, total_cents, fuel, station_name, full_tank, created_at';

export class SupabaseFillUpRepository implements FillUpRepository {
  async listByVehicle(ownerId: Id, vehicleId: Id): Promise<FillUp[]> {
    try {
      const { data, error } = await getSupabaseClient()
        .from('fill_ups')
        .select(COLUMNS)
        .eq('user_id', ownerId)
        .eq('vehicle_id', vehicleId)
        .order('odometer', { ascending: true })
        .order('date', { ascending: true });
      if (error) throw error;
      return data.map(rowToFillUp);
    } catch (cause) {
      throw new RepositoryError('Falha ao listar os abastecimentos.', cause);
    }
  }

  async findLastByVehicle(ownerId: Id, vehicleId: Id): Promise<FillUp | null> {
    try {
      const { data, error } = await getSupabaseClient()
        .from('fill_ups')
        .select(COLUMNS)
        .eq('user_id', ownerId)
        .eq('vehicle_id', vehicleId)
        .order('odometer', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data ? rowToFillUp(data) : null;
    } catch (cause) {
      throw new RepositoryError('Falha ao buscar o último abastecimento.', cause);
    }
  }

  async findById(ownerId: Id, id: Id): Promise<FillUp | null> {
    try {
      const { data, error } = await getSupabaseClient()
        .from('fill_ups')
        .select(COLUMNS)
        .eq('user_id', ownerId)
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data ? rowToFillUp(data) : null;
    } catch (cause) {
      throw new RepositoryError('Falha ao buscar o abastecimento.', cause);
    }
  }

  async save(ownerId: Id, fillUp: FillUp): Promise<void> {
    try {
      const { error } = await getSupabaseClient()
        .from('fill_ups')
        .upsert(fillUpToRow(ownerId, fillUp), { onConflict: 'id' });
      if (error) throw error;
    } catch (cause) {
      throw new RepositoryError('Falha ao salvar o abastecimento.', cause);
    }
  }

  async delete(ownerId: Id, id: Id): Promise<void> {
    try {
      const { error } = await getSupabaseClient().from('fill_ups').delete().eq('user_id', ownerId).eq('id', id);
      if (error) throw error;
    } catch (cause) {
      throw new RepositoryError('Falha ao excluir o abastecimento.', cause);
    }
  }

  async listStationNames(ownerId: Id): Promise<string[]> {
    try {
      const { data, error } = await getSupabaseClient()
        .from('fill_ups')
        .select('station_name')
        .eq('user_id', ownerId)
        .neq('station_name', '')
        .order('station_name', { ascending: true });
      if (error) throw error;
      return [...new Set(data.map((row) => row.station_name))];
    } catch (cause) {
      throw new RepositoryError('Falha ao listar os postos usados.', cause);
    }
  }
}
