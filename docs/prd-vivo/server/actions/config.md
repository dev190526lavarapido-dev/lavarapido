# config.ts

"use server"

## atualizarConfigLoja

RECEBE: data (objeto: nome_loja string, descricao? string, telefone? string, whatsapp? string, endereco_texto? string, maps_url? string, horario_funcionamento? string, instagram_url? string, mensagem_whatsapp_padrao? string, mensagens_etapas? Record<string,string>)
RETORNA: { data?: ConfigLoja, error?: string }

validar data com configLojaSchema → ver [lib/validations.md](../../lib/validations.md)
SE inválido → retorna { error: primeira mensagem de erro }

autenticar usuario → getUser
SE sem usuario → retorna { error: 'Não autenticado' }

TENTAR
  atualizar → BD [banco_de_dados.md](../../banco_de_dados.md) → configuracoes_loja onde user_id = usuario.id
  SE erro → retorna { error: mensagem }
  revalidar path /gestor/configuracoes
  retorna { data: config }

## atualizarAparencia

RECEBE: data (objeto: tema 'claro'|'escuro', paleta 'esmeralda'|'oceano'|'sol-coral'|'lavanda'|'asfalto', cor_primaria string)
RETORNA: { data?: ConfigLoja, error?: string }

validar data com aparenciaSchema → ver [lib/validations.md](../../lib/validations.md)
SE inválido → retorna { error: primeira mensagem de erro }

autenticar usuario → getUser
SE sem usuario → retorna { error: 'Não autenticado' }

TENTAR
  atualizar → BD [banco_de_dados.md](../../banco_de_dados.md) → configuracoes_loja onde user_id = usuario.id
  SE erro → retorna { error: mensagem }
  revalidar path /gestor/configuracoes
  retorna { data: config }

## uploadLogo

RECEBE: formData (FormData com campo 'logo')
RETORNA: { data?: string (url), error?: string }

SE sem arquivo → retorna { error: 'Nenhum arquivo enviado' }

autenticar usuario → getUser
SE sem usuario → retorna { error: 'Não autenticado' }

extrair extensão do nome do arquivo
montar fileName = logo_{timestamp}.{ext}
montar filePath = logos/{fileName}

TENTAR
  fazer upload no Storage bucket 'loja' em filePath (upsert: true)
  SE erro → retorna { error: mensagem }

  obter URL pública do Storage bucket 'loja' em filePath

  atualizar → BD [banco_de_dados.md](../../banco_de_dados.md) → configuracoes_loja → campo logo_url onde user_id = usuario.id
  SE erro → retorna { error: mensagem }

  revalidar path /gestor/configuracoes
  retorna { data: url pública }
