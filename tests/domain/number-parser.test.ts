import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  parseDecimalPtBr,
  parseMoneyPtBr,
  parseOptionalMoneyPtBr,
} from '../../src/domain/shared/number-parser';

function value(raw: string): number {
  const result = parseDecimalPtBr(raw);
  assert.equal(result.ok, true, `esperava sucesso ao converter "${raw}"`);
  return result.ok ? result.value : Number.NaN;
}

describe('parseDecimalPtBr', () => {
  it('converte decimal com vírgula', () => {
    assert.equal(value('32,4'), 32.4);
  });

  it('converte com separador de milhar e vírgula decimal', () => {
    assert.equal(value('1.248,50'), 1248.5);
  });

  it('aceita ponto decimal do teclado numérico', () => {
    assert.equal(value('1248.50'), 1248.5);
  });

  it('trata ponto como milhar quando há três casas à direita', () => {
    assert.equal(value('1.248'), 1248);
  });

  it('converte inteiro simples', () => {
    assert.equal(value('47010'), 47010);
  });

  it('ignora espaços em volta', () => {
    assert.equal(value('  6,29  '), 6.29);
  });

  it('recusa texto não numérico', () => {
    const result = parseDecimalPtBr('trinta litros', 'liters');
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error.code, 'valor-invalido');
      assert.equal(result.error.field, 'liters');
    }
  });

  it('recusa campo vazio', () => {
    const result = parseDecimalPtBr('', 'liters');
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error.code, 'campo-obrigatorio');
  });
});

describe('parseMoneyPtBr', () => {
  it('converte reais em centavos inteiros', () => {
    const result = parseMoneyPtBr('198,50');
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.value, 19850);
  });

  it('não perde centavos em valores com milhar', () => {
    const result = parseMoneyPtBr('1.248,50');
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.value, 124850);
  });

  it('arredonda para o centavo mais próximo', () => {
    const result = parseMoneyPtBr('241,354');
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.value, 24135);
  });
});

describe('parseOptionalMoneyPtBr', () => {
  it('devolve null para campo vazio', () => {
    const result = parseOptionalMoneyPtBr('');
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.value, null);
  });
});
