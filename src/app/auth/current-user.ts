import { redirect } from 'next/navigation';
import { cache } from 'react';
import { resolveSession } from '@/application/use-cases/resolve-session';
import type { User } from '@/domain/account/user';
import { getContainer } from '@/infrastructure/container';

/**
 * Quem está dirigindo.
 *
 * `cache` do React memoriza a resposta dentro de uma requisição: o layout, a
 * página e cada bloco perguntam à vontade, e o banco é consultado uma vez só.
 */
export const currentUser = cache(async (): Promise<User | null> => {
  const { users, sessions, tokens, sessionCookie } = getContainer();
  return resolveSession({ users, sessions, tokens }, await sessionCookie.read());
});

/** Para páginas que não existem sem conta: sem sessão, vai para a tela de entrar. */
export async function requireUser(): Promise<User> {
  const user = await currentUser();
  if (!user) redirect('/entrar');
  return user;
}
