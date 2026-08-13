import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createRegion, formatRegion, isUf, regionKey, UFS } from '../../src/domain/shared/region';

describe('regionKey', () => {
  it('ignora caixa, acento e espaço extra', () => {
    assert.equal(regionKey('São  José dos Pinhais', 'PR'), regionKey('sao jose dos pinhais', 'PR'));
  });

  it('separa a mesma cidade em estados diferentes', () => {
    assert.notEqual(regionKey('Barra Mansa', 'RJ'), regionKey('Barra Mansa', 'SP'));
  });
});

describe('createRegion', () => {
  it('aceita cidade e estado válidos e normaliza a chave', () => {
    const result = createRegion('  Curitiba ', 'pr');

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.value.city, 'Curitiba');
      assert.equal(result.value.state, 'PR');
      assert.equal(result.value.key, 'PR:curitiba');
    }
  });

  it('exige a cidade', () => {
    const result = createRegion('   ', 'PR');
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error.field, 'city');
  });

  it('recusa estado inexistente', () => {
    const result = createRegion('Curitiba', 'XY');
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error.field, 'state');
  });
});

describe('UFS', () => {
  it('traz as 27 unidades da federação', () => {
    assert.equal(UFS.length, 27);
    assert.equal(isUf('DF'), true);
    assert.equal(isUf('ZZ'), false);
  });
});

describe('formatRegion', () => {
  it('escreve cidade e estado como o motorista lê', () => {
    assert.equal(formatRegion({ city: 'Curitiba', state: 'PR' }), 'Curitiba — PR');
  });
});
