import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { cheapestGasolineStationId, createStation, stationNameKey } from '../../src/domain/station/station';
import type { Station } from '../../src/domain/station/station';

function station(id: string, gasolinePrice: number | null): Station {
  return {
    id,
    name: `Posto ${id}`,
    nameKey: `posto ${id}`,
    city: 'Curitiba',
    state: 'PR',
    regionKey: 'PR:curitiba',
    gasolinePrice,
    ethanolPrice: null,
    dieselPrice: null,
    priceDate: '2026-08-13',
    updatedAt: '2026-08-13T10:00:00.000Z',
    updatedBy: null,
    updatedByName: '',
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
      city: 'Curitiba',
      state: 'PR',
      gasolinePrice: 629,
      ethanolPrice: 419,
      dieselPrice: 589,
      priceDate: '2026-08-13',
    });

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.value.nameKey, 'shell av. brasil');
      assert.equal(result.value.gasolinePrice, 629);
      assert.equal(result.value.priceDate, '2026-08-13');
    }
  });

  it('aceita posto sem preços informados', () => {
    const result = createStation({
      name: 'Posto novo',
      city: 'Curitiba',
      state: 'PR',
      gasolinePrice: null,
      ethanolPrice: null,
      dieselPrice: null,
      priceDate: '2026-08-13',
    });
    assert.equal(result.ok, true);
  });

  it('exige o nome', () => {
    const result = createStation({
      name: '  ',
      city: 'Curitiba',
      state: 'PR',
      gasolinePrice: 629,
      ethanolPrice: null,
      dieselPrice: null,
      priceDate: '2026-08-13',
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error.field, 'name');
  });

  it('separa postos de mesmo nome em cidades diferentes', () => {
    const curitiba = createStation({
      name: 'Ipiranga Centro',
      city: 'Curitiba',
      state: 'PR',
      gasolinePrice: 619,
      ethanolPrice: null,
      dieselPrice: null,
      priceDate: '2026-08-13',
    });
    const joinville = createStation({
      name: 'Ipiranga Centro',
      city: 'Joinville',
      state: 'SC',
      gasolinePrice: 609,
      ethanolPrice: null,
      dieselPrice: null,
      priceDate: '2026-08-13',
    });

    assert.equal(curitiba.ok && joinville.ok, true);
    if (curitiba.ok && joinville.ok) {
      assert.equal(curitiba.value.nameKey, joinville.value.nameKey);
      assert.notEqual(curitiba.value.regionKey, joinville.value.regionKey);
    }
  });

  it('exige um estado válido', () => {
    const result = createStation({
      name: 'Posto',
      city: 'Curitiba',
      state: 'XX',
      gasolinePrice: 619,
      ethanolPrice: null,
      dieselPrice: null,
      priceDate: '2026-08-13',
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error.field, 'state');
  });

  it('recusa preço zerado ou negativo', () => {
    const result = createStation({
      name: 'Posto',
      city: 'Curitiba',
      state: 'PR',
      gasolinePrice: 0,
      ethanolPrice: null,
      dieselPrice: null,
      priceDate: '2026-08-13',
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error.field, 'gasoline');
  });

  it('recusa data de preço inválida', () => {
    const result = createStation({
      name: 'Posto',
      city: 'Curitiba',
      state: 'PR',
      gasolinePrice: 619,
      ethanolPrice: null,
      dieselPrice: null,
      priceDate: '2026-13-40',
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error.field, 'priceDate');
  });

  it('recusa data de preço no futuro', () => {
    const result = createStation({
      name: 'Posto',
      city: 'Curitiba',
      state: 'PR',
      gasolinePrice: 619,
      ethanolPrice: null,
      dieselPrice: null,
      priceDate: '2099-01-01',
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error.code, 'data-futura');
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
