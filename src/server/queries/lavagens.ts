'use server'

import { createClient } from '@/lib/supabase/server'
import type { LavagemComDetalhes, EventoLavagem } from '@/lib/types'

export async function getLavagens(): Promise<LavagemComDetalhes[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('lavagens')
    .select('*, cliente:clientes(*), veiculo:veiculos(*), servico:servicos_lavagem(*)')
    .order('entrada_em', { ascending: false })

  if (error) return []
  return (data ?? []) as unknown as LavagemComDetalhes[]
}

export async function getLavagensAtivas(): Promise<LavagemComDetalhes[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('lavagens')
    .select('*, cliente:clientes(*), veiculo:veiculos(*), servico:servicos_lavagem(*)')
    .eq('ativa', true)
    .order('entrada_em', { ascending: false })

  if (error) return []
  return (data ?? []) as unknown as LavagemComDetalhes[]
}

export async function getLavagemById(id: string): Promise<LavagemComDetalhes | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('lavagens')
    .select('*, cliente:clientes(*), veiculo:veiculos(*), servico:servicos_lavagem(*)')
    .eq('id', id)
    .single()

  if (error) return null
  return data as unknown as LavagemComDetalhes
}

export async function getEventosLavagem(lavagemId: string): Promise<EventoLavagem[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('eventos_lavagem')
    .select('*')
    .eq('lavagem_id', lavagemId)
    .order('created_at', { ascending: true })

  if (error) return []
  return (data ?? []) as EventoLavagem[]
}
