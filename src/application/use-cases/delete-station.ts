import type { StationRepository } from '../ports/station-repository';
import type { User } from '@/domain/account/user';
import type { Id } from '@/domain/shared/id';
import { fail, ok, type Result } from '@/domain/shared/result';
import type { Station } from '@/domain/station/station';

/**
 * Remove um posto da praça.
 *
 * Só quem fez a última anotação pode remover: o posto é coletivo, e apagar o
 * registro de outro motorista tiraria da cidade um preço que não é seu. Posto
 * de outra praça sequer é visível aqui.
 */
export async function deleteStation(repository: StationRepository, user: User, id: Id): Promise<Result<Station>> {
  const station = await repository.findById(id);
  if (!station || station.regionKey !== user.regionKey) {
    return fail('nao-encontrado', 'Posto não encontrado.');
  }

  if (station.updatedBy !== null && station.updatedBy !== user.id) {
    return fail('nao-autorizado', 'Esse preço foi anotado por outro motorista. Você pode corrigir, mas não apagar.');
  }

  await repository.delete(id);
  return ok(station);
}
