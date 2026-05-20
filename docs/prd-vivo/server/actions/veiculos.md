# veiculos.ts

"use server"

## criarVeiculo

RECEBE: data (objeto: cliente_id string, placa string, modelo? string, cor? string)
RETORNA: { data?: Veiculo, error?: string }

validar data com veiculoSchema → ver [lib/validations.md](../../lib/validations.md)
SE inválido → retorna { error: primeira mensagem de erro }

autenticar usuario → getUser
SE sem usuario → retorna { error: 'Não autenticado' }

TENTAR
  inserir → BD [banco_de_dados.md](../../banco_de_dados.md) → veiculos com user_id = usuario.id
  SE erro → retorna { error: mensagem }
  revalidar path /gestor/clientes
  retorna { data: veiculo }
