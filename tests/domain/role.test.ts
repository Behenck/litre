import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isAdmin } from '../../src/domain/account/role';

describe('isAdmin', () => {
  it('reconhece admin', () => {
    assert.equal(isAdmin({ role: 'admin' }), true);
  });

  it('trata membro como não admin', () => {
    assert.equal(isAdmin({ role: 'membro' }), false);
  });
});
