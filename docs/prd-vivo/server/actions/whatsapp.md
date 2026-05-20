# whatsapp.ts

"use server"

## registrarMensagem

RECEBE: lavagemId (string), tipo (string), mensagem (string), link (string)
RETORNA: { data?: MensagemWhatsapp, error?: string }

SE lavagemId, tipo ou mensagem ausentes → retorna { error: 'Dados obrigatórios faltando' }

autenticar usuario → getUser
SE sem usuario → retorna { error: 'Não autenticado' }

TENTAR
  inserir → BD [banco_de_dados.md](../../banco_de_dados.md) → mensagens_whatsapp
    com: { lavagem_id: lavagemId, tipo, mensagem, link }
  SE erro → retorna { error: mensagem }
  retorna { data: registro inserido }
