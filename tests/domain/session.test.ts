import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createEmailVerification,
  isVerificationExpired,
  VERIFICATION_TTL_SECONDS,
} from '../../src/domain/account/email-verification';
import { createSession, expiresAtFrom, isSessionExpired, SESSION_TTL_SECONDS } from '../../src/domain/account/session';

describe('createSession', () => {
  it('guarda o hash do token, nunca o token', () => {
    const session = createSession({
      userId: 'user-1',
      tokenHash: 'sha256-do-jwt',
      expiresAt: '2026-09-13T10:00:00.000Z',
    });

    assert.equal(session.userId, 'user-1');
    assert.equal(session.tokenHash, 'sha256-do-jwt');
    assert.ok(session.id.length > 0);
  });
});

describe('expiresAtFrom', () => {
  it('vence trinta dias depois da emissão', () => {
    const issuedAt = new Date('2026-08-13T10:00:00.000Z');
    assert.equal(expiresAtFrom(issuedAt), '2026-09-12T10:00:00.000Z');
    assert.equal(SESSION_TTL_SECONDS, 60 * 60 * 24 * 30);
  });
});

describe('isSessionExpired', () => {
  const session = createSession({
    userId: 'user-1',
    tokenHash: 'hash',
    expiresAt: '2026-09-12T10:00:00.000Z',
  });

  it('vale antes do vencimento', () => {
    assert.equal(isSessionExpired(session, '2026-09-11T23:59:59.000Z'), false);
  });

  it('não vale depois do vencimento', () => {
    assert.equal(isSessionExpired(session, '2026-09-12T10:00:00.001Z'), true);
  });
});

describe('createEmailVerification', () => {
  it('vence em vinte e quatro horas a partir da criação', () => {
    const verification = createEmailVerification({
      tokenHash: 'hash',
      userId: 'user-1',
      createdAt: '2026-08-13T10:00:00.000Z',
    });

    assert.equal(verification.expiresAt, '2026-08-14T10:00:00.000Z');
    assert.equal(VERIFICATION_TTL_SECONDS, 60 * 60 * 24);
    assert.equal(isVerificationExpired(verification, '2026-08-14T09:59:59.000Z'), false);
    assert.equal(isVerificationExpired(verification, '2026-08-14T10:00:01.000Z'), true);
  });
});
