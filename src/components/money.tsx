/**
 * Formata um valor numérico em reais brasileiros.
 * @example moneyBR(45) → "R$ 45,00"
 */
export function moneyBR(valor: number): string {
  return "R$ " + valor.toFixed(2).replace(".", ",");
}

interface MoneyProps {
  value: number;
  className?: string;
}

export function Money({ value, className }: MoneyProps) {
  return <span className={className}>{moneyBR(value)}</span>;
}
