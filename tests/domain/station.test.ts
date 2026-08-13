import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { cheapestGasolineStationId, createStation, stationNameKey } from '../../src/domain/station/station';
import type { Station } from '../../src/domain/station/station';

function station(id: string, gasolinePrice: number | null): Station {
  return {
    id,
    name: `Posto ${id}`,
    nameKey: `posto ${id}`,
    gasolinePrice,
    ethanolPrice: null,
    dieselPrice: null,
    updatedAt: '2026-08-13T10:00:00.000Z',
  };
}

describe('stationNameKey', () => {
  it('ignora caixa, acento e espaço extra', () => {
    assert.equal(stationNameKey('Shell  Av. Brasil '), stationNameKey('shell av. brasil'));
    assert.equal(stationNameKey('Posto Ipiranga Centro'), stationNameKey('POSTO IPIRANGA CENTRO'));
    assert.equal(stationNameKey('Petrobrás'), 'petrobras');
  });
});

describe('createStation', () => {
  it('cria um posto com os três preços', () => {
    const result = createStation({
      name: 'Shell Av. Brasil',
      gasolinePrice: 629,
      ethanolPrice: 419,
      dieselPrice: 589,
    });

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.value.nameKey, 'shell av. brasil');
      assert.equal(result.value.gasolinePrice, 629);
    }
  });

  it('aceita posto sem preços informados', () => {
    const result = createStation({
      name: 'Posto novo',
      gasolinePrice: null,
      ethanolPrice: null,
      dieselPrice: null,
    });
    assert.equal(result.ok, true);
  });

  it('exige o nome', () => {
    const result = createStation({ name: '  ', gasolinePrice: 629, ethanolPrice: null, dieselPrice: null });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error.field, 'name');
  });

  it('recusa preço zerado ou negativo', () => {
    const result = createStation({ name: 'Posto', gasolinePrice: 0, ethanolPrice: null, dieselPrice: null });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error.field, 'gasoline');
  });
});

describe('cheapestGasolineStationId', () => {
  it('aponta o posto com a gasolina mais barata', () => {
    const stations = [station('a', 629), station('b', 609), station('c', 619)];
    assert.equal(cheapestGasolineStationId(stations), 'b');
  });

  it('ignora postos sem preço de gasolina', () => {
    const stations = [station('a', null), station('b', 619)];
    assert.equal(cheapestGasolineStationId(stations), 'b');
  });

  it('devolve null quando nenhum posto tem preço', () => {
    assert.equal(cheapestGasolineStationId([station('a', null)]), null);
  });

  it('devolve null para lista vazia', () => {
    assert.equal(cheapestGasolineStationId([]), null);
  });
});
