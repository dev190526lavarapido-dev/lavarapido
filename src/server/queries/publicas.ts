'use server'

import { createClient } from '@/lib/supabase/server'
import type { LavagemComDetalhes, EventoLavagem, ServicoLavagem } from '@/lib/types'

export async function getLavagemPorToken(token: string): Promise<(LavagemComDetalhes & { eventos: EventoLavagem[] }) | null> {
  const supabase = await createClient()

  const { data: lavagem, error } = await supabase
    .from('lavagens')
    .select('*, cliente:clientes(*), veiculo:veiculos(*), servico:servicos_lavagem(*)')
    .eq('token_publico', token)
    .single()

  if (error || !lavagem) return null

  const { data: eventos } = await supabase
    .from('eventos_lavagem')
    .select('*')
    .eq('lavagem_id', lavagem.id)
    .order('created_at', { ascending: true })

  return {
    ...(lavagem as unknown as LavagemComDetalhes),
    eventos: (eventos ?? []) as EventoLavagem[],
  }
}

export async function getServicosPublicos(): Promise<ServicoLavagem[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('servicos_lavagem')
    .select('*')
    .eq('ativo', true)
    .order('ordem_exibicao', { ascending: true })

  if (error) return []
  return (data ?? []) as ServicoLavagem[]
}
