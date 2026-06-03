'use server'

import { createClient } from '@/lib/supabase/server'
import { novaLavagemSchema, ocorrenciaSchema } from '@/lib/validations'
import { STATUS_TRANSITIONS } from '@/lib/constants'
import type { LavagemStatus } from '@/lib/constants'
import { revalidatePath } from 'next/cache'
import { randomBytes } from 'node:crypto'
import type { Lavagem } from '@/lib/types'

export async function criarLavagem(data: {
  cliente_id: string
  veiculo_id: string
  servico_id: string
  valor: number
  observacao?: string
}): Promise<{ data?: Lavagem; error?: string }> {
  const parsed = novaLavagemSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  // Gerar token público forte (128 bits), consistente com o default do schema
  const token = randomBytes(16).toString('hex')

  const { data: lavagem, error } = await supabase
    .from('lavagens')
    .insert({
      ...parsed.data,
      user_id: user.id,
      token_publico: token,
      status_atual: 'aguardando_lavagem',
      ativa: true,
      entrada_em: new Date().toISOString(),
    })
    .select()
    .single()

  if (error || !lavagem) return { error: error?.message ?? 'Erro ao criar lavagem' }

  // Criar eventos iniciais
  await supabase.from('eventos_lavagem').insert([
    { lavagem_id: lavagem.id, status: 'entrada', descricao: 'Veículo deu entrada' },
    { lavagem_id: lavagem.id, status: 'aguardando_lavagem', descricao: 'Aguardando lavagem' },
  ])

  revalidatePath('/gestor/dashboard')
  revalidatePath('/gestor/lavagens')
  return { data: lavagem as Lavagem }
}

export async function mudarStatus(
  lavagemId: string,
  novoStatus: LavagemStatus
): Promise<{ data?: Lavagem; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data: lavagem, error: errBusca } = await supabase
    .from('lavagens')
    .select('id, status_atual')
    .eq('id', lavagemId)
    .eq('user_id', user.id)
    .single()

  if (errBusca || !lavagem) return { error: 'Lavagem não encontrada' }

  const statusAtual = lavagem.status_atual as LavagemStatus
  const transicoesPermitidas = STATUS_TRANSITIONS[statusAtual] ?? []

  if (!transicoesPermitidas.includes(novoStatus)) {
    return { error: `Transição de "${statusAtual}" para "${novoStatus}" não é permitida` }
  }

  const updates: Record<string, unknown> = { status_atual: novoStatus }
  if (novoStatus === 'retirado') {
    updates.ativa = false
    updates.retirada_em = new Date().toISOString()
  }
  if (novoStatus === 'aguardando_lavagem' || novoStatus === 'lavando') {
    updates.ativa = true
  }

  const { data: atualizada, error } = await supabase
    .from('lavagens')
    .update(updates)
    .eq('id', lavagemId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { error: error.message }

  // Criar evento
  await supabase.from('eventos_lavagem').insert({
    lavagem_id: lavagemId,
    status: novoStatus,
    descricao: `Status alterado para ${novoStatus}`,
  })

  revalidatePath('/gestor/dashboard')
  revalidatePath('/gestor/lavagens')
  return { data: atualizada as Lavagem }
}

export async function registrarOcorrencia(
  lavagemId: string,
  descricao: string
): Promise<{ data?: Lavagem; error?: string }> {
  const parsed = ocorrenciaSchema.safeParse({ descricao })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data: lavagem, error } = await supabase
    .from('lavagens')
    .update({
      status_atual: 'ocorrencia',
      ocorrencia_descricao: parsed.data.descricao,
    })
    .eq('id', lavagemId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { error: error.message }

  // Criar evento
  await supabase.from('eventos_lavagem').insert({
    lavagem_id: lavagemId,
    status: 'ocorrencia',
    descricao: parsed.data.descricao,
  })

  revalidatePath('/gestor/dashboard')
  revalidatePath('/gestor/lavagens')
  return { data: lavagem as Lavagem }
}
