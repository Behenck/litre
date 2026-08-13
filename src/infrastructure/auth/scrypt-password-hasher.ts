import 'server-only';

import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import type { PasswordHasher } from '@/application/ports/password-hasher';

/**
 * Hash de senha com scrypt, da biblioteca padrão do Node.
 *
 * scrypt é caro de propósito: gasta CPU e memória, o que torna força bruta
 * lenta mesmo com o banco na mão. Cada senha tem sal próprio, então duas
 * pessoas com a mesma senha têm hashes diferentes.
 *
 * Formato guardado: `scrypt$<sal em base64>$<hash em base64>`.
 */

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number },
) => Promise<Buffer>;

const PREFIX = 'scrypt';
const SALT_BYTES = 16;
const KEY_BYTES = 64;
/** ~16 MB e alguns milissegundos por tentativa — imperceptível ao entrar, caro em massa. */
const PARAMS = { N: 16_384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

async function derive(password: string, salt: Buffer): Promise<Buffer> {
  return scryptAsync(password.normalize('NFKC'), salt, KEY_BYTES, PARAMS);
}

export class ScryptPasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    const salt = randomBytes(SALT_BYTES);
    const derived = await derive(password, salt);
    return `${PREFIX}$${salt.toString('base64')}$${derived.toString('base64')}`;
  }

  async verify(password: string, hash: string): Promise<boolean> {
    const [prefix, salt, expected] = hash.split('$');
    if (prefix !== PREFIX || !salt || !expected) return false;

    try {
      const derived = await derive(password, Buffer.from(salt, 'base64'));
      const stored = Buffer.from(expected, 'base64');
      return derived.length === stored.length && timingSafeEqual(derived, stored);
    } catch {
      return false;
    }
  }
}
