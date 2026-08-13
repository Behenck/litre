import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { computeVehicleStats } from '../../src/domain/analytics/vehicle-stats';
import type { FillUp } from '../../src/domain/fill-up/fill-up';

function fillUp(id: string, odometer: number, liters: number, totalCents: number, fullTank = true): FillUp {
  return {
    id,
    vehicleId: 'v1',
    date: '2026-06-02',
    odometer,
    liters,
    total: totalCents,
    fuel: 'gasolina-comum',
    stationName: 'Posto',
    fullTank,
    createdAt: '2026-06-02',
  };
}

describe('computeVehicleStats', () => {
  it('devolve zeros sem abastecimentos', () => {
    const stats = computeVehicleStats([]);
    assert.equal(stats.averageKmPerLiter, 0);
    assert.equal(stats.costPerKm, 0);
    assert.equal(stats.totalSpent, 0);
    assert.equal(stats.trend, null);
  });

  it('soma o total gasto já com um único abastecimento', () => {
    const stats = computeVehicleStats([fillUp('f1', 47010, 38.2, 24135)]);
    assert.equal(stats.totalSpent, 24135);
    assert.equal(stats.totalLiters, 38.2);
    assert.equal(stats.averageKmPerLiter, 0);
  });

  it('calcula custo por km a partir do último preço e da média', () => {
    // 2º abastecimento: R$ 203,47 ÷ 32,4 L = 628 centavos/L
    // média = 388 ÷ 32,4 = 11,975 km/L  →  628 / 11,975 ≈ 52 centavos/km
    const stats = computeVehicleStats([fillUp('f1', 47010, 38.2, 24135), fillUp('f2', 47398, 32.4, 20347)]);
    assert.equal(stats.lastPricePerLiter, 628);
    assert.equal(stats.costPerKm, 52);
  });

  it('inclui abastecimento parcial no gasto mas não na média', () => {
    const comFullTank = computeVehicleStats([fillUp('f1', 47010, 38.2, 24135), fillUp('f2', 47398, 32.4, 20347)]);
    const comParcial = computeVehicleStats([
      fillUp('f1', 47010, 38.2, 24135),
      fillUp('f2', 47398, 32.4, 20347),
      fillUp('f3', 47500, 10, 6300, false),
    ]);

    assert.equal(comParcial.totalSpent, comFullTank.totalSpent + 6300);
    assert.equal(comParcial.legs.length, comFullTank.legs.length);
    assert.equal(comParcial.averageKmPerLiter, comFullTank.averageKmPerLiter);
  });

  it('calcula a tendência entre os dois últimos trechos', () => {
    // trecho 1: 400/40 = 10 km/L; trecho 2: 440/40 = 11 km/L → +10%
    const stats = computeVehicleStats([
      fillUp('f1', 0, 40, 20000),
      fillUp('f2', 400, 40, 20000),
      fillUp('f3', 840, 40, 20000),
    ]);
    assert.equal(stats.legs.length, 2);
    assert.ok(Math.abs((stats.trend ?? 0) - 0.1) < 1e-9);
  });

  it('não calcula tendência com um único trecho', () => {
    const stats = computeVehicleStats([fillUp('f1', 0, 40, 20000), fillUp('f2', 400, 40, 20000)]);
    assert.equal(stats.trend, null);
  });

  it('recalcula ao remover um abastecimento', () => {
    const todos = [fillUp('f1', 0, 40, 20000), fillUp('f2', 400, 40, 20000), fillUp('f3', 840, 40, 20000)];
    const semUltimo = computeVehicleStats(todos.slice(0, 2));

    assert.equal(computeVehicleStats(todos).totalSpent, 60000);
    assert.equal(semUltimo.totalSpent, 40000);
    assert.equal(semUltimo.legs.length, 1);
  });
});
