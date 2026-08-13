import type { UserRepository } from '../ports/user-repository';
import { moveTo, type User } from '@/domain/account/user';
import { createRegion } from '@/domain/shared/region';
import { ok, type Result } from '@/domain/shared/result';

/**
 * Troca a cidade do motorista.
 *
 * Muda o que ele enxerga em Postos — a praça anterior fica intacta, com os
 * preços que ele anotou lá, porque posto é dado coletivo e não vai embora com
 * quem se mudou.
 */
export async function updateRegion(
  users: UserRepository,
  user: User,
  input: { city: string; state: string },
): Promise<Result<User>> {
  const region = createRegion(input.city, input.state);
  if (!region.ok) return region;

  const moved = moveTo(user, region.value);
  await users.save(moved);

  return ok(moved);
}
