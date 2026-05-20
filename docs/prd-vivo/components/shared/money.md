# money

## moneyBR

RECEBE: valor (number)
RETORNA: string "R$ " + valor.toFixed(2) com ponto trocado por virgula
EXEMPLO: moneyBR(45) → "R$ 45,00"

---

## Money

RECEBE: value (number), className? (string)

RENDERIZA
  span com className contendo moneyBR(value)
