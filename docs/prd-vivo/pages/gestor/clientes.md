# gestor/clientes/page.tsx

## ClientesPage (async Server Component)

BUSCA
  clientes ← getClientes() → BD [banco_de_dados.md](../../banco_de_dados.md) → clientes (inclui veiculos)

CALCULA
  totalVeiculos = clientes.reduce((acc, c) => acc + c.veiculos.length, 0)

RENDERIZA
  ClientesView clientes=clientes totalVeiculos=totalVeiculos (→ ver componente gestor/clientes-view)
