import 'server-only';

import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import type { SessionClaims, SessionTokens } from '@/application/ports/session-tokens';

/**
 * JWT HS256 assinado com `node:crypto`.
 *
 * Sem biblioteca: o formato é três blocos base64url e uma HMAC-SHA256, e uma
 * dependência a menos é uma superfície a menos (Princípio V). A comparação da
 * assinatura é em tempo constante — comparar com `===` vazaria, byte a byte,
 * quanto do palpite estava certo.
 */

const HEADER = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
const MIN_SECRET = 32;

interface Payload {
  readonly sub: string;
  readonly sid: string;
  readonly iat: number;
  readonly exp: number;
}

function base64url(value: string | Buffer): string {
  return Buffer.from(value).toString('base64url');
}

function secret(): string {
  const value = process.env.LITRO_JWT_SECRET ?? '';
  if (value.length < MIN_SECRET) {
    throw new Error(`Configure LITRO_JWT_SECRET com pelo menos ${MIN_SECRET} caracteres para assinar as sessões.`);
  }
  return value;
}

function signature(data: string): string {
  return createHmac('sha256', secret()).update(data).digest('base64url');
}

function signatureMatches(data: string, presented: string): boolean {
  const expected = Buffer.from(signature(data));
  const received = Buffer.from(presented);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

function parsePayload(raw: string): Payload | null {
  try {
    const parsed: unknown = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
    if (typeof parsed !== 'object' || parsed === null) return null;

    const { sub, sid, exp } = parsed as Record<string, unknown>;
    if (typeof sub !== 'string' || typeof sid !== 'string' || typeof exp !== 'number') return null;

    return parsed as Payload;
  } catch {
    return null;
  }
}

export class JwtSessionTokens implements SessionTokens {
  issue(claims: SessionClaims, ttlSeconds: number): string {
    const issuedAt = Math.floor(Date.now() / 1000);
    const payload: Payload = {
      sub: claims.userId,
      sid: claims.sessionId,
      iat: issuedAt,
      exp: issuedAt + ttlSeconds,
    };

    const data = `${HEADER}.${base64url(JSON.stringify(payload))}`;
    return `${data}.${signature(data)}`;
  }

  verify(token: string): SessionClaims | null {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header = '', body = '', presented = ''] = parts;
    if (header !== HEADER) return null;
    if (!signatureMatches(`${header}.${body}`, presented)) return null;

    const payload = parsePayload(body);
    if (!payload) return null;
    if (payload.exp <= Math.floor(Date.now() / 1000)) return null;

    return { userId: payload.sub, sessionId: payload.sid };
  }

  fingerprint(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
