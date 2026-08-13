import type { FillUpRepository } from '../ports/fill-up-repository';
import type { FillUp } from '@/domain/fill-up/fill-up';
import type { Id } from '@/domain/shared/id';
import { fail, ok, type Result } from '@/domain/shared/result';

/**
 * Exclui um abastecimento.
 *
 * Todos os indicadores são derivados, então basta remover o registro: média,
 * total gasto e gráfico se recalculam sozinhos na próxima leitura.
 */
export async function deleteFillUp(repository: FillUpRepository, ownerId: Id, id: Id): Promise<Result<FillUp>> {
  const fillUp = await repository.findById(ownerId, id);
  if (!fillUp) {
    return fail('nao-encontrado', 'Abastecimento não encontrado.');
  }

  await repository.delete(ownerId, id);
  return ok(fillUp);
}
