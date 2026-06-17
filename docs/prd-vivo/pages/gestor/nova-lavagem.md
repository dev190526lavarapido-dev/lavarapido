# gestor/nova-lavagem/page.tsx

## NovaLavagemPage (async Server Component)

BUSCA em paralelo
  clientes ← getClientes() → ver [server/queries/clientes.md](../../server/queries/clientes.md) → BD [banco_de_dados.md](../../banco_de_dados.md) → clientes
  servicos ← getServicosAtivos() → ver [server/queries/servicos.md](../../server/queries/servicos.md) → BD [banco_de_dados.md](../../banco_de_dados.md) → servicos

RENDERIZA
  NovaLavagemWizard clientes=clientes servicos=servicos → ver [components/gestor/nova-lavagem-wizard.md](../../components/gestor/nova-lavagem-wizard.md)
