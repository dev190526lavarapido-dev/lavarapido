# lavagens

## getLavagens

RECEBE: nada

TENTAR
  buscar → BD [banco_de_dados.md](../../banco_de_dados.md) → lavagens (com cliente, veiculo, servico aninhados)
  ordenar por: entrada_em DESC
SE FALHAR
  retorna array vazio

retorna lista de LavagemComDetalhes

---

## getLavagensAtivas

RECEBE: nada

TENTAR
  buscar → BD [banco_de_dados.md](../../banco_de_dados.md) → lavagens (com cliente, veiculo, servico aninhados)
  com filtro: ativa = true
  ordenar por: entrada_em DESC
SE FALHAR
  retorna array vazio

retorna lista de LavagemComDetalhes

---

## getLavagemById

RECEBE: id (string)

TENTAR
  buscar → BD [banco_de_dados.md](../../banco_de_dados.md) → lavagens (com cliente, veiculo, servico aninhados)
  com filtro: id = id
  registro único
SE FALHAR
  retorna null

retorna LavagemComDetalhes

---

## getEventosLavagem

RECEBE: lavagemId (string)

TENTAR
  buscar → BD [banco_de_dados.md](../../banco_de_dados.md) → eventos_lavagem
  com filtro: lavagem_id = lavagemId
  ordenar por: created_at ASC
SE FALHAR
  retorna array vazio

retorna lista de EventoLavagem
