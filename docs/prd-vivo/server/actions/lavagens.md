# lavagens.ts

"use server"

## criarLavagem

RECEBE: data (objeto: cliente_id string, veiculo_id string, servico_id string, valor number, observacao? string)
RETORNA: { data?: Lavagem, error?: string }

validar data com novaLavagemSchema → ver [lib/validations.md](../../lib/validations.md)
SE inválido → retorna { error: primeira mensagem de erro }

autenticar usuario → getUser
SE sem usuario → retorna { error: 'Não autenticado' }

gerar token_publico = UUID sem hifens, primeiros 12 chars

TENTAR
  inserir → BD [banco_de_dados.md](../../banco_de_dados.md) → lavagens
    com: dados validados + user_id=usuario.id, token_publico, status_atual='aguardando_lavagem', ativa=true, entrada_em=agora
  SE erro ou sem lavagem → retorna { error: mensagem }

  inserir → BD [banco_de_dados.md](../../banco_de_dados.md) → eventos_lavagem
    evento 1: { lavagem_id, status='entrada', descricao='Veículo deu entrada' }
    evento 2: { lavagem_id, status='aguardando_lavagem', descricao='Aguardando lavagem' }

  revalidar path /gestor/dashboard
  revalidar path /gestor/lavagens
  retorna { data: lavagem }

## mudarStatus

RECEBE: lavagemId (string), novoStatus (LavagemStatus)
RETORNA: { data?: Lavagem, error?: string }

autenticar usuario → getUser
SE sem usuario → retorna { error: 'Não autenticado' }

buscar → BD [banco_de_dados.md](../../banco_de_dados.md) → lavagens → id e status_atual onde id = lavagemId E user_id = usuario.id
SE erro ou não encontrada → retorna { error: 'Lavagem não encontrada' }

consultar STATUS_TRANSITIONS[statusAtual] → ver [lib/constants.md](../../lib/constants.md)
SE novoStatus não está nas transições permitidas → retorna { error: mensagem de transição inválida }

montar updates = { status_atual: novoStatus }
SE novoStatus = 'retirado' → adicionar ativa=false, retirada_em=agora
SE novoStatus = 'aguardando_lavagem' OU 'lavando' → adicionar ativa=true

TENTAR
  atualizar → BD [banco_de_dados.md](../../banco_de_dados.md) → lavagens onde id = lavagemId E user_id = usuario.id
  SE erro → retorna { error: mensagem }

  inserir → BD [banco_de_dados.md](../../banco_de_dados.md) → eventos_lavagem
    { lavagem_id: lavagemId, status: novoStatus, descricao: 'Status alterado para {novoStatus}' }

  revalidar path /gestor/dashboard
  revalidar path /gestor/lavagens
  retorna { data: lavagem atualizada }

## registrarOcorrencia

RECEBE: lavagemId (string), descricao (string)
RETORNA: { data?: Lavagem, error?: string }

validar { descricao } com ocorrenciaSchema → ver [lib/validations.md](../../lib/validations.md)
SE inválido → retorna { error: primeira mensagem de erro }

autenticar usuario → getUser
SE sem usuario → retorna { error: 'Não autenticado' }

TENTAR
  atualizar → BD [banco_de_dados.md](../../banco_de_dados.md) → lavagens onde id = lavagemId E user_id = usuario.id
    com: status_atual='ocorrencia', ocorrencia_descricao=descricao validada
  SE erro → retorna { error: mensagem }

  inserir → BD [banco_de_dados.md](../../banco_de_dados.md) → eventos_lavagem
    { lavagem_id: lavagemId, status: 'ocorrencia', descricao: descricao validada }

  revalidar path /gestor/dashboard
  revalidar path /gestor/lavagens
  retorna { data: lavagem }
