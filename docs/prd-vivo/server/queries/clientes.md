# clientes

## getClientes

RECEBE: nada

TENTAR
  buscar → BD [banco_de_dados.md](../../banco_de_dados.md) → clientes (com veiculos aninhados)
  ordenar por: nome ASC
SE FALHAR
  retorna array vazio

buscar → BD [banco_de_dados.md](../../banco_de_dados.md) → lavagens
  selecionar: cliente_id

montar dicionário contagemPorCliente: cliente_id → número de lavagens

retorna lista de clientes com campo extra total_lavagens (da contagem)

---

## getClienteById

RECEBE: id (string)

TENTAR
  buscar → BD [banco_de_dados.md](../../banco_de_dados.md) → clientes (com veiculos aninhados)
  com filtro: id = id
  registro único
SE FALHAR ou não encontrar
  retorna null

buscar → BD [banco_de_dados.md](../../banco_de_dados.md) → lavagens (com cliente, veiculo, servico aninhados)
  com filtro: cliente_id = id
  ordenar por: entrada_em DESC

retorna cliente com:
  total_lavagens = quantidade de lavagens encontradas
  lavagens = lista de lavagens com detalhes
