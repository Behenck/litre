/**
 * Dinheiro em centavos inteiros.
 *
 * Somar reais em ponto flutuante acumula erro de centavos em totais longos —
 * a especificação exige que a média e os totais confiram com o cálculo manual.
 */

export type Money = number;

export function moneyFromReais(reais: number): Money {
  return Math.round(reais * 100);
}

export function moneyToReais(cents: Money): number {
  return cents / 100;
}

export function sumMoney(values: readonly Money[]): Money {
  return values.reduce((total, value) => total + value, 0);
}

/** Divide centavos por uma quantidade contínua (litros, km) devolvendo centavos. */
export function divideMoney(cents: Money, divisor: number): Money {
  if (divisor === 0) return 0;
  return Math.round(cents / divisor);
}
