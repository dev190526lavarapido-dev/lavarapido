# servicos.ts

"use server"

## criarServico

RECEBE: data (objeto: nome string, descricao? string, valor number, tempo_estimado_minutos? number|null, ativo? boolean, ordem_exibicao? number)
RETORNA: { data?: ServicoLavagem, error?: string }

validar data com servicoSchema → ver [lib/validations.md](../../lib/validations.md)
SE inválido → retorna { error: primeira mensagem de erro }

autenticar usuario → getUser
SE sem usuario → retorna { error: 'Não autenticado' }

TENTAR
  inserir → BD [banco_de_dados.md](../../banco_de_dados.md) → servicos_lavagem com user_id = usuario.id
  SE erro → retorna { error: mensagem }
  revalidar path /gestor/servicos
  retorna { data: servico }

## atualizarServico

RECEBE: id (string), data (Partial: nome string, descricao string, valor number, tempo_estimado_minutos number|null, ativo boolean, ordem_exibicao number)
RETORNA: { data?: ServicoLavagem, error?: string }

validar data com servicoSchema.partial() → ver [lib/validations.md](../../lib/validations.md)
SE inválido → retorna { error: primeira mensagem de erro }

autenticar usuario → getUser
SE sem usuario → retorna { error: 'Não autenticado' }

TENTAR
  atualizar → BD [banco_de_dados.md](../../banco_de_dados.md) → servicos_lavagem onde id = id E user_id = usuario.id
  SE erro → retorna { error: mensagem }
  revalidar path /gestor/servicos
  retorna { data: servico }

## toggleServico

RECEBE: id (string)
RETORNA: { data?: ServicoLavagem, error?: string }

autenticar usuario → getUser
SE sem usuario → retorna { error: 'Não autenticado' }

buscar → BD [banco_de_dados.md](../../banco_de_dados.md) → servicos_lavagem → campo ativo onde id = id E user_id = usuario.id
SE erro ou não encontrado → retorna { error: 'Serviço não encontrado' }

TENTAR
  atualizar → BD [banco_de_dados.md](../../banco_de_dados.md) → servicos_lavagem onde id = id E user_id = usuario.id
    com: ativo = !ativo_atual
  SE erro → retorna { error: mensagem }
  revalidar path /gestor/servicos
  retorna { data: servico }
