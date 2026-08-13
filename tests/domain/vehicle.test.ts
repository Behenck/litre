import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createVehicle, vehicleDisplayName, type VehicleInput } from '../../src/domain/vehicle/vehicle';
import { createPlate, formatPlate } from '../../src/domain/vehicle/plate';

function input(overrides: Partial<VehicleInput> = {}): VehicleInput {
  return {
    type: 'carro',
    brand: 'Honda',
    model: 'Civic EXL',
    year: 2019,
    plate: 'RTG4B21',
    color: '#B8BDC4',
    mainFuel: 'gasolina-comum',
    nickname: '',
    initialOdometer: 48210,
    ...overrides,
  };
}

describe('createVehicle', () => {
  it('cria um veículo válido', () => {
    const result = createVehicle(input());
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.value.model, 'Civic EXL');
      assert.equal(result.value.colorName, 'Prata');
      assert.equal(result.value.plate, 'RTG4B21');
    }
  });

  it('exige o modelo', () => {
    const result = createVehicle(input({ model: '   ' }));
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error.code, 'campo-obrigatorio');
      assert.equal(result.error.field, 'model');
    }
  });

  it('aceita cadastro só com o modelo', () => {
    const result = createVehicle(
      input({ brand: '', year: null, plate: '', nickname: '', initialOdometer: 0, model: 'Uno' }),
    );
    assert.equal(result.ok, true);
  });

  it('recusa ano fora de faixa', () => {
    const result = createVehicle(input({ year: 1800 }));
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error.field, 'year');
  });

  it('recusa quilometragem negativa', () => {
    const result = createVehicle(input({ initialOdometer: -1 }));
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error.field, 'odometer');
  });

  it('recusa placa com tamanho inválido', () => {
    const result = createVehicle(input({ plate: 'ABC12' }));
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error.field, 'plate');
  });

  it('normaliza a placa para maiúsculas sem separadores', () => {
    const result = createVehicle(input({ plate: 'rtg-4b21' }));
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.value.plate, 'RTG4B21');
  });

  it('usa combustível padrão quando o valor é desconhecido', () => {
    const result = createVehicle(input({ mainFuel: 'querosene' }));
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.value.mainFuel, 'gasolina-comum');
  });
});

describe('vehicleDisplayName', () => {
  it('prefere o apelido', () => {
    const result = createVehicle(input({ nickname: 'Carro do trabalho' }));
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(vehicleDisplayName(result.value), 'Carro do trabalho');
  });

  it('cai para marca e modelo sem apelido', () => {
    const result = createVehicle(input());
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(vehicleDisplayName(result.value), 'Honda Civic EXL');
  });
});

describe('plate', () => {
  it('aceita placa vazia', () => {
    const result = createPlate('');
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.value, '');
  });

  it('formata para leitura', () => {
    assert.equal(formatPlate('RTG4B21'), 'RTG-4B21');
  });
});
