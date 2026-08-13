import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createFillUp, type FillUpInput, pricePerLiter } from '../../src/domain/fill-up/fill-up';
import { toIsoDate } from '../../src/domain/shared/iso-date';

function input(overrides: Partial<FillUpInput> = {}): FillUpInput {
  return {
    vehicleId: 'v1',
    date: '2026-06-02',
    odometer: 47010,
    liters: 38.2,
    total: 24135,
    fuel: 'gasolina-comum',
    stationName: 'Shell Av. Brasil',
    fullTank: true,
    ...overrides,
  };
}

function tomorrow(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return toIsoDate(date);
}

describe('createFillUp', () => {
  it('cria um abastecimento válido', () => {
    const result = createFillUp(input());
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.value.liters, 38.2);
      assert.equal(result.value.total, 24135);
      assert.equal(result.value.fullTank, true);
    }
  });

  it('recusa litros iguais a zero', () => {
    const result = createFillUp(input({ liters: 0 }));
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error.field, 'liters');
  });

  it('recusa litros negativos', () => {
    const result = createFillUp(input({ liters: -5 }));
    assert.equal(result.ok, false);
  });

  it('recusa valor total igual a zero', () => {
    const result = createFillUp(input({ total: 0 }));
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error.field, 'total');
  });

  it('recusa data no futuro', () => {
    const result = createFillUp(input({ date: tomorrow() }));
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error.code, 'data-futura');
  });

  it('recusa data inexistente', () => {
    const result = createFillUp(input({ date: '2026-02-31' }));
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error.code, 'valor-invalido');
  });

  it('exige veículo selecionado', () => {
    const result = createFillUp(input({ vehicleId: '' }));
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error.field, 'vehicleId');
  });

  it('aceita abastecimento parcial', () => {
    const result = createFillUp(input({ fullTank: false }));
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.value.fullTank, false);
  });
});

describe('pricePerLiter', () => {
  it('calcula o preço por litro em centavos', () => {
    // R$ 241,35 ÷ 38,2 L = R$ 6,318…/L
    assert.equal(pricePerLiter({ total: 24135, liters: 38.2 }), 632);
  });

  it('devolve zero quando não há litros', () => {
    assert.equal(pricePerLiter({ total: 24135, liters: 0 }), 0);
  });
});
