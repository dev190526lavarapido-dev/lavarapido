# gestor/nova-lavagem/page.tsx

## NovaLavagemPage (async Server Component)

BUSCA em paralelo
  clientes ← getClientes() → BD [banco_de_dados.md](../../banco_de_dados.md) → clientes
  servicos ← getServicosAtivos() → BD [banco_de_dados.md](../../banco_de_dados.md) → servicos

RENDERIZA
  NovaLavagemWizard clientes=clientes servicos=servicos (→ ver componente gestor/nova-lavagem-wizard)
