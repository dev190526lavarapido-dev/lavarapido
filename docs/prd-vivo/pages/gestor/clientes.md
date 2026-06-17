# gestor/clientes/page.tsx

## ClientesPage (async Server Component)

BUSCA
  clientes ← getClientes() → ver [server/queries/clientes.md](../../server/queries/clientes.md) → BD [banco_de_dados.md](../../banco_de_dados.md) → clientes (inclui veiculos)

CALCULA
  totalVeiculos = clientes.reduce((acc, c) => acc + c.veiculos.length, 0)

RENDERIZA
  ClientesView clientes=clientes totalVeiculos=totalVeiculos → ver [components/gestor/clientes-view.md](../../components/gestor/clientes-view.md)
