# clientes.ts

"use server"

## criarCliente

RECEBE: data (objeto: nome string, whatsapp string)
RETORNA: { data?: Cliente, error?: string }

validar data com clienteSchema → ver [lib/validations.md](../../lib/validations.md)
SE inválido → retorna { error: primeira mensagem de erro }

autenticar usuario → getUser
SE sem usuario → retorna { error: 'Não autenticado' }

TENTAR
  inserir → BD [banco_de_dados.md](../../banco_de_dados.md) → clientes com user_id = usuario.id
  SE erro → retorna { error: mensagem }
  revalidar path /gestor/clientes
  retorna { data: cliente }

## criarClienteComVeiculo

RECEBE: clienteData (objeto: nome string, whatsapp string), veiculoData (objeto: placa string, modelo? string, cor? string)
RETORNA: { data?: { cliente: Cliente, veiculo: Veiculo }, error?: string }

validar clienteData com clienteSchema → ver [lib/validations.md](../../lib/validations.md)
SE inválido → retorna { error: primeira mensagem de erro }

autenticar usuario → getUser
SE sem usuario → retorna { error: 'Não autenticado' }

TENTAR
  inserir → BD [banco_de_dados.md](../../banco_de_dados.md) → clientes com user_id = usuario.id
  SE erro ou sem cliente → retorna { error: mensagem }

  validar { ...veiculoData, cliente_id } com veiculoSchema → ver [lib/validations.md](../../lib/validations.md)
  SE inválido → retorna { error: primeira mensagem de erro }

  inserir → BD [banco_de_dados.md](../../banco_de_dados.md) → veiculos com user_id = usuario.id
  SE erro ou sem veiculo → retorna { error: mensagem }

  revalidar path /gestor/clientes
  retorna { data: { cliente, veiculo } }
