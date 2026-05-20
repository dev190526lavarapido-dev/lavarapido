# dashboard

## getDashboardStats

RECEBE: nada

calcular todayISO = data de hoje às 00:00:00 em ISO string

buscar → BD [banco_de_dados.md](../../banco_de_dados.md) → lavagens
  selecionar: id, status_atual, ativa, valor, entrada_em, retirada_em

filtrar listas:
  entradas   = lavagens com entrada_em >= todayISO
  aguardando = lavagens com status_atual = 'aguardando_lavagem'
  lavando    = lavagens com status_atual = 'lavando'
  concluidas = lavagens com status_atual = 'lavagem_concluida'
  ocorrencias= lavagens com status_atual = 'ocorrencia'
  retirados  = lavagens com status_atual = 'retirado'

calcular:
  faturamentoPrevisto = soma de valor das entradas do dia
  dinheiroRecebido    = soma de valor dos retirados com retirada_em >= todayISO

retorna objeto com:
  entradas, aguardando, lavando, concluidas, ocorrencias, retirados (contagens)
  faturamentoPrevisto, dinheiroRecebido (valores)
