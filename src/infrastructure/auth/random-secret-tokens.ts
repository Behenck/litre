import 'server-only';

import { createHash, randomBytes } from 'node:crypto';
import type { SecretTokens } from '@/application/ports/secret-tokens';

/**
 * Segredos de uso único para os links de e-mail.
 *
 * 32 bytes de `randomBytes` (aleatoriedade criptográfica, não `Math.random`):
 * adivinhar um link de confirmação é tão viável quanto adivinhar uma chave.
 */

const TOKEN_BYTES = 32;

export class RandomSecretTokens implements SecretTokens {
  create(): string {
    return randomBytes(TOKEN_BYTES).toString('base64url');
  }

  fingerprint(secret: string): string {
    return createHash('sha256').update(secret).digest('hex');
  }
}
