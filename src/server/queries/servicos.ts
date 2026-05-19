'use server'

import { createClient } from '@/lib/supabase/server'
import type { ServicoLavagem } from '@/lib/types'

export async function getServicos(): Promise<ServicoLavagem[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('servicos_lavagem')
    .select('*')
    .order('ordem_exibicao', { ascending: true })

  if (error) return []
  return (data ?? []) as ServicoLavagem[]
}

export async function getServicosAtivos(): Promise<ServicoLavagem[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('servicos_lavagem')
    .select('*')
    .eq('ativo', true)
    .order('ordem_exibicao', { ascending: true })

  if (error) return []
  return (data ?? []) as ServicoLavagem[]
}
