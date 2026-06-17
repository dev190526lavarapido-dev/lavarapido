'use server'

import { createClient } from '@/lib/supabase/server'
import type { LavagemComDetalhes, EventoLavagem, ServicoLavagem } from '@/lib/types'

export async function getLavagemPorToken(token: string): Promise<(LavagemComDetalhes & { eventos: EventoLavagem[] }) | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_lavagem_publica', { p_token: token })

  if (error || !data) return null

  return data as unknown as LavagemComDetalhes & { eventos: EventoLavagem[] }
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
