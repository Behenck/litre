import type { VehicleRepository } from '@/application/ports/vehicle-repository';
import type { Id } from '@/domain/shared/id';
import { RepositoryError } from '@/domain/shared/result';
import type { Vehicle } from '@/domain/vehicle/vehicle';
import { getSupabaseClient } from './client';
import { rowToVehicle, vehicleToRow } from './mappers';

const COLUMNS =
  'id, user_id, type, brand, model, year, plate, color, color_name, main_fuel, nickname, initial_odometer, created_at';

/**
 * Todo `select`, `update` e `delete` carrega `user_id`: o filtro do dono está
 * na consulta, não na camada de cima. Id de outro motorista não é achado.
 */
export class SupabaseVehicleRepository implements VehicleRepository {
  async list(ownerId: Id): Promise<Vehicle[]> {
    try {
      const { data, error } = await getSupabaseClient()
        .from('vehicles')
        .select(COLUMNS)
        .eq('user_id', ownerId)
        .order('created_at', { ascending: true })
        .order('model', { ascending: true });
      if (error) throw error;
      return data.map(rowToVehicle);
    } catch (cause) {
      throw new RepositoryError('Falha ao listar veículos.', cause);
    }
  }

  async findById(ownerId: Id, id: Id): Promise<Vehicle | null> {
    try {
      const { data, error } = await getSupabaseClient()
        .from('vehicles')
        .select(COLUMNS)
        .eq('user_id', ownerId)
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data ? rowToVehicle(data) : null;
    } catch (cause) {
      throw new RepositoryError('Falha ao buscar o veículo.', cause);
    }
  }

  async save(ownerId: Id, vehicle: Vehicle): Promise<void> {
    try {
      const { error } = await getSupabaseClient()
        .from('vehicles')
        .upsert(vehicleToRow(ownerId, vehicle), { onConflict: 'id' });
      if (error) throw error;
    } catch (cause) {
      throw new RepositoryError('Falha ao salvar o veículo.', cause);
    }
  }

  async delete(ownerId: Id, id: Id): Promise<void> {
    try {
      const { error } = await getSupabaseClient().from('vehicles').delete().eq('user_id', ownerId).eq('id', id);
      if (error) throw error;
    } catch (cause) {
      throw new RepositoryError('Falha ao excluir o veículo.', cause);
    }
  }

  async countFillUps(ownerId: Id, id: Id): Promise<number> {
    try {
      const { count, error } = await getSupabaseClient()
        .from('fill_ups')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', ownerId)
        .eq('vehicle_id', id);
      if (error) throw error;
      return count ?? 0;
    } catch (cause) {
      throw new RepositoryError('Falha ao contar os abastecimentos do veículo.', cause);
    }
  }
}
