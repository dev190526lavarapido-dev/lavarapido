# publicas

## getLavagemPorToken

RECEBE: token (string)

TENTAR
  buscar → BD [banco_de_dados.md](../../banco_de_dados.md) → lavagens (com cliente, veiculo, servico aninhados)
  com filtro: token_publico = token
  registro único
SE FALHAR ou não encontrar
  retorna null

buscar → BD [banco_de_dados.md](../../banco_de_dados.md) → eventos_lavagem
  com filtro: lavagem_id = lavagem.id
  ordenar por: created_at ASC

retorna lavagem com campo extra eventos = lista de EventoLavagem

---

## getServicosPublicos

RECEBE: nada

TENTAR
  buscar → BD [banco_de_dados.md](../../banco_de_dados.md) → servicos_lavagem
  com filtro: ativo = true
  ordenar por: ordem_exibicao ASC
SE FALHAR
  retorna array vazio

retorna lista de ServicoLavagem
