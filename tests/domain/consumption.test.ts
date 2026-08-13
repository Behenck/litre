import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { averageKmPerLiter, computeLegs, weightedAverageKmPerLiter } from '../../src/domain/analytics/consumption';
import type { FillUp } from '../../src/domain/fill-up/fill-up';

function fillUp(id: string, odometer: number, liters: number, fullTank = true): FillUp {
  return {
    id,
    vehicleId: 'v1',
    date: '2026-06-02',
    odometer,
    liters,
    total: 20000,
    fuel: 'gasolina-comum',
    stationName: 'Posto',
    fullTank,
    createdAt: '2026-06-02',
  };
}

describe('computeLegs', () => {
  it('não produz trecho com um único abastecimento', () => {
    assert.equal(computeLegs([fillUp('f1', 47010, 38.2)]).length, 0);
  });

  it('produz um trecho com dois abastecimentos de tanque cheio', () => {
    const legs = computeLegs([fillUp('f1', 47010, 38.2), fillUp('f2', 47398, 32.4)]);
    assert.equal(legs.length, 1);
    assert.equal(legs[0]?.distance, 388);
    assert.equal(legs[0]?.liters, 32.4);
    assert.ok(Math.abs((legs[0]?.kmPerLiter ?? 0) - 388 / 32.4) < 1e-9);
  });

  it('ignora o odômetro fora de ordem na entrada', () => {
    const legs = computeLegs([fillUp('f2', 47398, 32.4), fillUp('f1', 47010, 38.2)]);
    assert.equal(legs.length, 1);
    assert.equal(legs[0]?.fillUpId, 'f2');
  });

  it('não fecha trecho em abastecimento parcial', () => {
    const legs = computeLegs([fillUp('f1', 47010, 38.2), fillUp('f2', 47398, 32.4, false)]);
    assert.equal(legs.length, 0);
  });

  it('mede desde o abastecimento anterior quando o do meio foi parcial', () => {
    const legs = computeLegs([
      fillUp('f1', 47000, 38),
      fillUp('f2', 47200, 15, false),
      fillUp('f3', 47500, 25),
    ]);
    assert.equal(legs.length, 1);
    assert.equal(legs[0]?.distance, 300);
  });

  it('descarta trecho com distância nula ou negativa', () => {
    const legs = computeLegs([fillUp('f1', 47010, 38.2), fillUp('f2', 47010, 32.4)]);
    assert.equal(legs.length, 0);
  });

  it('sinaliza consumo implausível sem descartar o trecho', () => {
    const legs = computeLegs([fillUp('f1', 47000, 38), fillUp('f2', 52000, 30)]);
    assert.equal(legs.length, 1);
    assert.equal(legs[0]?.suspicious, true);
  });
});

describe('weightedAverageKmPerLiter', () => {
  it('devolve zero sem trechos', () => {
    assert.equal(weightedAverageKmPerLiter([]), 0);
  });

  it('pondera pela distância, não pela média dos consumos', () => {
    // 900 km com 90 L e 20 km com 10 L: ponderada = 920/100 = 9,2 km/L.
    // A média aritmética dos consumos (10 e 2) daria 6 km/L — está errada.
    const legs = computeLegs([fillUp('f1', 0, 50), fillUp('f2', 900, 90), fillUp('f3', 920, 10)]);
    assert.equal(legs.length, 2);
    assert.ok(Math.abs(weightedAverageKmPerLiter(legs) - 9.2) < 1e-9);
  });

  it('reproduz o cálculo manual do motorista', () => {
    // Cenário do quickstart: (47398 − 47010) ÷ 32,4 = 11,975… km/L
    const media = averageKmPerLiter([fillUp('f1', 47010, 38.2), fillUp('f2', 47398, 32.4)]);
    assert.ok(Math.abs(media - 388 / 32.4) < 1e-9);
    assert.equal(Number(media.toFixed(2)), 11.98);
  });
});
