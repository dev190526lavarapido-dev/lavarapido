'use server'

import { createClient } from '@/lib/supabase/server'
import { servicoSchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'
import type { ServicoLavagem } from '@/lib/types'

export async function criarServico(data: {
  nome: string
  descricao?: string
  valor: number
  tempo_estimado_minutos?: number | null
  ativo?: boolean
  ordem_exibicao?: number
}): Promise<{ data?: ServicoLavagem; error?: string }> {
  const parsed = servicoSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }
  }

  const supabase = await createClient()
  const { data: servico, error } = await supabase
    .from('servicos_lavagem')
    .insert(parsed.data)
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/gestor/servicos')
  return { data: servico as ServicoLavagem }
}

export async function atualizarServico(
  id: string,
  data: Partial<{
    nome: string
    descricao: string
    valor: number
    tempo_estimado_minutos: number | null
    ativo: boolean
    ordem_exibicao: number
  }>
): Promise<{ data?: ServicoLavagem; error?: string }> {
  const parsed = servicoSchema.partial().safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }
  }

  const supabase = await createClient()
  const { data: servico, error } = await supabase
    .from('servicos_lavagem')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/gestor/servicos')
  return { data: servico as ServicoLavagem }
}

export async function toggleServico(id: string): Promise<{ data?: ServicoLavagem; error?: string }> {
  const supabase = await createClient()

  // Buscar estado atual
  const { data: atual, error: errBusca } = await supabase
    .from('servicos_lavagem')
    .select('ativo')
    .eq('id', id)
    .single()

  if (errBusca || !atual) return { error: 'Serviço não encontrado' }

  const { data: servico, error } = await supabase
    .from('servicos_lavagem')
    .update({ ativo: !atual.ativo })
    .eq('id', id)
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/gestor/servicos')
  return { data: servico as ServicoLavagem }
}
