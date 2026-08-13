/**
 * Porta do cookie que carrega o token de sessão.
 *
 * Cookie (e não localStorage) porque o servidor precisa saber quem é o
 * motorista antes de renderizar a primeira tela.
 */
export interface SessionCookie {
  read(): Promise<string | null>;
  write(token: string, maxAgeSeconds: number): Promise<void>;
  clear(): Promise<void>;
}
