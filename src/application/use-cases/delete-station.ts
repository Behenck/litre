import type { StationRepository } from '../ports/station-repository';
import { isAdmin } from '@/domain/account/role';
import type { User } from '@/domain/account/user';
import type { Id } from '@/domain/shared/id';
import { fail, ok, type Result } from '@/domain/shared/result';
import type { Station } from '@/domain/station/station';

/**
 * Remove um posto da praça.
 *
 * Só quem criou o posto pode remover, ou um admin: o posto é coletivo, e
 * apagar o registro de outro motorista tiraria da cidade um preço que não é
 * seu. Corrigir o preço continua liberado para qualquer um da praça — só a
 * remoção é restrita. Posto de outra praça sequer é visível aqui.
 */
export async function deleteStation(repository: StationRepository, user: User, id: Id): Promise<Result<Station>> {
  const station = await repository.findById(id);
  if (!station || station.regionKey !== user.regionKey) {
    return fail('nao-encontrado', 'Posto não encontrado.');
  }

  if (!isAdmin(user) && station.createdBy !== null && station.createdBy !== user.id) {
    return fail('nao-autorizado', 'Esse posto foi criado por outro motorista. Só quem criou ou um admin pode apagar.');
  }

  await repository.delete(id);
  return ok(station);
}
