# clientes.ts

## criarCliente

RECEBE: data (objeto: nome string, whatsapp string)
RETORNA: { data?: Cliente, error?: string }

TENTAR
  validar data com clienteSchema → ver [lib/validations.md](../../lib/validations.md)
  SE inválido → retorna { error: primeira mensagem de erro }

  autenticar usuario → getUser
  SE sem usuario → retorna { error: 'Não autenticado' }

  inserir → BD [banco_de_dados.md](../../banco_de_dados.md) → clientes com user_id = usuario.id
  SE erro → retorna { error: mensagem }
  revalidar path /gestor/clientes
  retorna { data: cliente }
SE FALHAR
  retorna { error: mensagem }

## atualizarCliente

RECEBE: clienteId (string), data (objeto: nome string, whatsapp string)
RETORNA: { data?: Cliente, error?: string }

TENTAR
  validar data com clienteSchema → ver [lib/validations.md](../../lib/validations.md)
  SE inválido → retorna { error: primeira mensagem de erro }

  autenticar usuario → getUser
  SE sem usuario → retorna { error: 'Não autenticado' }

  atualizar → BD [banco_de_dados.md](../../banco_de_dados.md) → clientes onde id = clienteId E user_id = usuario.id
  SE erro → retorna { error: mensagem }
  revalidar path /gestor/clientes
  retorna { data: cliente }
SE FALHAR
  retorna { error: mensagem }

## atualizarVeiculo

RECEBE: veiculoId (string), data (objeto: placa string, modelo? string, cor? string)
RETORNA: { data?: Veiculo, error?: string }

TENTAR
  autenticar usuario → getUser
  SE sem usuario → retorna { error: 'Não autenticado' }

  atualizar → BD [banco_de_dados.md](../../banco_de_dados.md) → veiculos onde id = veiculoId E user_id = usuario.id
    com: placa = placa.toUpperCase().trim(), modelo = modelo?.trim() ?? '', cor = cor?.trim() ?? ''
  SE erro → retorna { error: mensagem }
  revalidar path /gestor/clientes
  retorna { data: veiculo }
SE FALHAR
  retorna { error: mensagem }

## adicionarVeiculo

RECEBE: clienteId (string), data (objeto: placa string, modelo? string, cor? string)
RETORNA: { data?: Veiculo, error?: string }

TENTAR
  validar { ...data, cliente_id: clienteId } com veiculoSchema → ver [lib/validations.md](../../lib/validations.md)
  SE inválido → retorna { error: primeira mensagem de erro }

  autenticar usuario → getUser
  SE sem usuario → retorna { error: 'Não autenticado' }

  inserir → BD [banco_de_dados.md](../../banco_de_dados.md) → veiculos com user_id = usuario.id
  SE erro → retorna { error: mensagem }
  revalidar path /gestor/clientes
  retorna { data: veiculo }
SE FALHAR
  retorna { error: mensagem }

## removerVeiculo

RECEBE: veiculoId (string)
RETORNA: { error?: string }

TENTAR
  autenticar usuario → getUser
  SE sem usuario → retorna { error: 'Não autenticado' }

  deletar → BD [banco_de_dados.md](../../banco_de_dados.md) → veiculos onde id = veiculoId E user_id = usuario.id
  SE erro → retorna { error: mensagem }
  revalidar path /gestor/clientes
  retorna {}
SE FALHAR
  retorna { error: mensagem }

## criarClienteComVeiculo

RECEBE: clienteData (objeto: nome string, whatsapp string), veiculoData (objeto: placa string, modelo? string, cor? string)
RETORNA: { data?: { cliente: Cliente, veiculo: Veiculo }, error?: string }

TENTAR
  validar clienteData com clienteSchema → ver [lib/validations.md](../../lib/validations.md)
  SE inválido → retorna { error: primeira mensagem de erro }

  autenticar usuario → getUser
  SE sem usuario → retorna { error: 'Não autenticado' }

  inserir → BD [banco_de_dados.md](../../banco_de_dados.md) → clientes com user_id = usuario.id
  SE erro ou sem cliente → retorna { error: mensagem }

  validar { ...veiculoData, cliente_id: cliente.id } com veiculoSchema → ver [lib/validations.md](../../lib/validations.md)
  SE inválido → retorna { error: primeira mensagem de erro }

  inserir → BD [banco_de_dados.md](../../banco_de_dados.md) → veiculos com user_id = usuario.id
  SE erro ou sem veiculo → retorna { error: mensagem }

  revalidar path /gestor/clientes
  retorna { data: { cliente, veiculo } }
SE FALHAR
  retorna { error: mensagem }
