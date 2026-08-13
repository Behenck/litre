import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  convertFromKmPerLiter,
  higherIsBetter,
  isConsumptionUnit,
  unitLabel,
  unitPrecision,
} from '../../src/domain/shared/consumption-unit';

describe('convertFromKmPerLiter', () => {
  it('mantém o valor em km/L', () => {
    assert.equal(convertFromKmPerLiter(11.975, 'km/l'), 11.975);
  });

  it('converte para L/100km', () => {
    // 11,975 km/L → 100 / 11,975 = 8,35 L/100km
    const converted = convertFromKmPerLiter(11.975, 'l/100km');
    assert.ok(Math.abs(converted - 8.3507) < 1e-3);
  });

  it('é reversível', () => {
    const original = 12.5;
    const l100 = convertFromKmPerLiter(original, 'l/100km');
    assert.ok(Math.abs(100 / l100 - original) < 1e-9);
  });

  it('devolve zero para consumo inexistente', () => {
    assert.equal(convertFromKmPerLiter(0, 'l/100km'), 0);
  });
});

describe('metadados da unidade', () => {
  it('rotula corretamente', () => {
    assert.equal(unitLabel('km/l'), 'km/L');
    assert.equal(unitLabel('l/100km'), 'L/100km');
  });

  it('usa precisão adequada a cada unidade', () => {
    assert.equal(unitPrecision('km/l'), 2);
    assert.equal(unitPrecision('l/100km'), 1);
  });

  it('sabe em qual unidade maior é melhor', () => {
    assert.equal(higherIsBetter('km/l'), true);
    assert.equal(higherIsBetter('l/100km'), false);
  });

  it('valida a unidade recebida do cookie', () => {
    assert.equal(isConsumptionUnit('km/l'), true);
    assert.equal(isConsumptionUnit('milhas'), false);
  });
});
