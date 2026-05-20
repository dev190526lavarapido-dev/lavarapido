# config

## getConfigLoja

RECEBE: nada
USA: cliente Supabase do servidor (autenticado)

TENTAR
  buscar → BD [banco_de_dados.md](../../banco_de_dados.md) → configuracoes_loja
  registro único
SE FALHAR
  retorna null

retorna ConfigLoja

---

## getConfigLojaPublica

RECEBE: nada
USA: cliente Supabase do servidor (autenticado, mesmo que getConfigLoja)

TENTAR
  buscar → BD [banco_de_dados.md](../../banco_de_dados.md) → configuracoes_loja
  registro único
SE FALHAR
  retorna null

retorna ConfigLoja
