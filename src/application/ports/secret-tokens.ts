/**
 * Porta dos segredos de uso único que viajam por e-mail.
 *
 * O segredo em claro só existe dentro do link; o banco guarda a impressão
 * digital. Vazamento do banco não permite confirmar conta alheia.
 */
export interface SecretTokens {
  create(): string;
  fingerprint(secret: string): string;
}
