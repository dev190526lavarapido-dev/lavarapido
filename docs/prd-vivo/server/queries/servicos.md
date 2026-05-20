# servicos

## getServicos

RECEBE: nada

TENTAR
  buscar → BD [banco_de_dados.md](../../banco_de_dados.md) → servicos_lavagem
  ordenar por: ordem_exibicao ASC
SE FALHAR
  retorna array vazio

retorna lista de ServicoLavagem

---

## getServicosAtivos

RECEBE: nada

TENTAR
  buscar → BD [banco_de_dados.md](../../banco_de_dados.md) → servicos_lavagem
  com filtro: ativo = true
  ordenar por: ordem_exibicao ASC
SE FALHAR
  retorna array vazio

retorna lista de ServicoLavagem
