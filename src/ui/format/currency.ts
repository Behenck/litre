import { moneyToReais, type Money } from '@/domain/shared/money';

/**
 * Formatação de moeda em pt-BR.
 *
 * Centralizada para que "R$ 1.248,50" tenha exatamente a mesma forma em todas
 * as telas.
 */

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatMoney(cents: Money): string {
  return BRL.format(moneyToReais(cents));
}

/** Preço por litro com três casas, como aparece na bomba. */
export function formatPricePerLiter(cents: Money): string {
  return `${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(
    moneyToReais(cents),
  )}`;
}

/** Valor em reais para preencher campo de formulário ("198,50"). */
export function moneyToInputValue(cents: Money | null): string {
  if (cents === null) return '';
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
    moneyToReais(cents),
  );
}
