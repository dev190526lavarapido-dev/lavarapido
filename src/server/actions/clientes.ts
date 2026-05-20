'use server'

import { createClient } from '@/lib/supabase/server'
import { clienteSchema, veiculoSchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'
import type { Cliente, Veiculo } from '@/lib/types'

export async function criarCliente(data: { nome: string; whatsapp: string }): Promise<{ data?: Cliente; error?: string }> {
  const parsed = clienteSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data: cliente, error } = await supabase
    .from('clientes')
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/gestor/clientes')
  return { data: cliente as Cliente }
}

export async function criarClienteComVeiculo(
  clienteData: { nome: string; whatsapp: string },
  veiculoData: { placa: string; modelo?: string; cor?: string }
): Promise<{ data?: { cliente: Cliente; veiculo: Veiculo }; error?: string }> {
  const parsedCliente = clienteSchema.safeParse(clienteData)
  if (!parsedCliente.success) {
    return { error: parsedCliente.error.issues[0]?.message ?? 'Dados do cliente inválidos' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  // Criar cliente
  const { data: cliente, error: errCliente } = await supabase
    .from('clientes')
    .insert({ ...parsedCliente.data, user_id: user.id })
    .select()
    .single()

  if (errCliente || !cliente) return { error: errCliente?.message ?? 'Erro ao criar cliente' }

  // Validar e criar veículo
  const parsedVeiculo = veiculoSchema.safeParse({
    ...veiculoData,
    cliente_id: cliente.id,
  })
  if (!parsedVeiculo.success) {
    return { error: parsedVeiculo.error.issues[0]?.message ?? 'Dados do veículo inválidos' }
  }

  const { data: veiculo, error: errVeiculo } = await supabase
    .from('veiculos')
    .insert({ ...parsedVeiculo.data, user_id: user.id })
    .select()
    .single()

  if (errVeiculo || !veiculo) return { error: errVeiculo?.message ?? 'Erro ao criar veículo' }

  revalidatePath('/gestor/clientes')
  return { data: { cliente: cliente as Cliente, veiculo: veiculo as Veiculo } }
}
