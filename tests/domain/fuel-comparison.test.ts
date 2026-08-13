import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { compareFuels, DEFAULT_YIELD_RATIO } from '../../src/domain/analytics/fuel-comparison';

describe('compareFuels', () => {
  it('recomenda etanol quando a proporção fica abaixo do fator', () => {
    // 4,19 / 6,29 = 66,6% < 70%
    const result = compareFuels({
      gasolinePrice: 629,
      ethanolPrice: 419,
      yieldRatio: 0.7,
      gasolineKmPerLiter: 12,
    });

    assert.equal(result.winner, 'etanol');
    assert.ok(result.explanation.includes('67%'));
  });

  it('recomenda gasolina quando a proporção passa do fator', () => {
    // 4,80 / 6,29 = 76,3% > 70%
    const result = compareFuels({
      gasolinePrice: 629,
      ethanolPrice: 480,
      yieldRatio: 0.7,
      gasolineKmPerLiter: 12,
    });

    assert.equal(result.winner, 'gasolina');
  });

  it('não recomenda nada quando falta um preço', () => {
    const result = compareFuels({
      gasolinePrice: 629,
      ethanolPrice: null,
      yieldRatio: 0.7,
      gasolineKmPerLiter: 12,
    });

    assert.equal(result.winner, 'indefinido');
    assert.equal(result.priceRatio, null);
    assert.equal(result.costPerKmGasoline, null);
    assert.ok(result.explanation.includes('Informe'));
  });

  it('cai para o fator padrão quando o rendimento é inválido', () => {
    for (const invalid of [null, 0, -1, 5]) {
      const result = compareFuels({
        gasolinePrice: 629,
        ethanolPrice: 419,
        yieldRatio: invalid,
        gasolineKmPerLiter: 12,
      });
      assert.equal(result.yieldRatio, DEFAULT_YIELD_RATIO);
    }
  });

  it('usa a média real do veículo no custo por km', () => {
    // gasolina: 629 centavos ÷ 10 km/L = 63 centavos/km
    // etanol:   419 centavos ÷ (10 × 0,7) = 60 centavos/km
    const result = compareFuels({
      gasolinePrice: 629,
      ethanolPrice: 419,
      yieldRatio: 0.7,
      gasolineKmPerLiter: 10,
    });

    assert.equal(result.costPerKmGasoline, 63);
    assert.equal(result.costPerKmEthanol, 60);
  });

  it('usa referência quando o veículo ainda não tem média', () => {
    const result = compareFuels({
      gasolinePrice: 600,
      ethanolPrice: 400,
      yieldRatio: 0.7,
      gasolineKmPerLiter: null,
    });

    assert.equal(result.costPerKmGasoline, 50); // 600 / 12
  });

  it('respeita um fator de rendimento personalizado', () => {
    // Com fator 0,75, uma proporção de 72% passa a favorecer o etanol.
    const result = compareFuels({
      gasolinePrice: 600,
      ethanolPrice: 432,
      yieldRatio: 0.75,
      gasolineKmPerLiter: 12,
    });

    assert.equal(result.winner, 'etanol');
    assert.equal(result.yieldRatio, 0.75);
  });
});
