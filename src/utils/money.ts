import Decimal from 'decimal.js';

export function toCents(str: string): number {
  return new Decimal(str).mul(100).toDecimalPlaces(0).toNumber();
}

export function centsToDollars(cents: number): number {
  return new Decimal(cents).div(100).toNumber();
}