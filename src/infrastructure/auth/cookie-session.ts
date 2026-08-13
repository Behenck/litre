import { cookies } from 'next/headers';
import type { SessionCookie } from '@/application/ports/session-cookie';

export const SESSION_COOKIE = 'litro.sessao';

/**
 * Token de sessão em cookie.
 *
 * `httpOnly` para script nenhum na página conseguir ler o token, `sameSite:
 * lax` para o cookie não viajar em requisição disparada por outro site, e
 * `secure` fora de desenvolvimento — em `localhost` não há HTTPS.
 */
export class CookieSession implements SessionCookie {
  async read(): Promise<string | null> {
    const store = await cookies();
    return store.get(SESSION_COOKIE)?.value ?? null;
  }

  async write(token: string, maxAgeSeconds: number): Promise<void> {
    const store = await cookies();
    store.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: maxAgeSeconds,
    });
  }

  async clear(): Promise<void> {
    const store = await cookies();
    store.delete(SESSION_COOKIE);
  }
}
