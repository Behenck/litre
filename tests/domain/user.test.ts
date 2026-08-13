import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createEmail, emailKey } from '../../src/domain/account/email';
import { validatePassword } from '../../src/domain/account/password';
import { createUser, isVerified, markVerified, moveTo } from '../../src/domain/account/user';

function input(overrides: Partial<Parameters<typeof createUser>[0]> = {}) {
  return {
    name: 'Denilson Behenck',
    email: 'motorista@exemplo.com',
    passwordHash: 'hash-qualquer',
    city: 'Curitiba',
    state: 'PR',
    ...overrides,
  };
}

describe('createEmail', () => {
  it('normaliza caixa e espaço', () => {
    const result = createEmail('  Joao@Exemplo.COM ');
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.value, 'joao@exemplo.com');
  });

  it('recusa endereço sem domínio', () => {
    assert.equal(createEmail('joao@exemplo').ok, false);
    assert.equal(createEmail('joao.exemplo.com').ok, false);
    assert.equal(createEmail('').ok, false);
  });

  it('trata o mesmo endereço escrito de formas diferentes como um só', () => {
    assert.equal(emailKey(' JOAO@Exemplo.com'), emailKey('joao@exemplo.com'));
  });
});

describe('validatePassword', () => {
  it('exige pelo menos oito caracteres', () => {
    assert.equal(validatePassword('1234567').ok, false);
    assert.equal(validatePassword('12345678').ok, true);
  });

  it('recusa senha só de espaços', () => {
    assert.equal(validatePassword('         ').ok, false);
  });
});

describe('createUser', () => {
  it('cria a conta ainda não verificada', () => {
    const result = createUser(input());

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.value.email, 'motorista@exemplo.com');
      assert.equal(result.value.regionKey, 'PR:curitiba');
      assert.equal(result.value.emailVerifiedAt, null);
      assert.equal(isVerified(result.value), false);
      assert.equal(result.value.role, 'membro');
    }
  });

  it('exige nome, e-mail e região válidos', () => {
    assert.equal(createUser(input({ name: ' ' })).ok, false);
    assert.equal(createUser(input({ email: 'nao-e-email' })).ok, false);
    assert.equal(createUser(input({ state: 'XX' })).ok, false);
  });
});

describe('markVerified', () => {
  it('confirma o e-mail uma vez só', () => {
    const created = createUser(input());
    assert.equal(created.ok, true);
    if (!created.ok) return;

    const verified = markVerified(created.value, '2026-08-13T10:00:00.000Z');
    assert.equal(isVerified(verified), true);

    const again = markVerified(verified, '2026-09-01T10:00:00.000Z');
    assert.equal(again.emailVerifiedAt, '2026-08-13T10:00:00.000Z');
  });
});

describe('moveTo', () => {
  it('troca a praça de postos do motorista', () => {
    const created = createUser(input());
    assert.equal(created.ok, true);
    if (!created.ok) return;

    const moved = moveTo(created.value, { city: 'Joinville', state: 'SC', key: 'SC:joinville' });
    assert.equal(moved.regionKey, 'SC:joinville');
    assert.equal(moved.city, 'Joinville');
  });
});
