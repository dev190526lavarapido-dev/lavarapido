'use server'

import { createClient } from '@/lib/supabase/server'
import type { ClienteComVeiculos, LavagemComDetalhes } from '@/lib/types'

export async function getClientes(): Promise<ClienteComVeiculos[]> {
  const supabase = await createClient()

  const { data: clientes, error } = await supabase
    .from('clientes')
    .select('*, veiculos(*), lavagens(count)')
    .order('nome', { ascending: true })

  if (error) return []

  return (clientes ?? []).map(({ lavagens, ...c }) => ({
    ...c,
    total_lavagens: lavagens?.[0]?.count ?? 0,
  })) as ClienteComVeiculos[]
}

export async function getClienteById(id: string): Promise<(ClienteComVeiculos & { lavagens: LavagemComDetalhes[] }) | null> {
  const supabase = await createClient()

  const { data: cliente, error } = await supabase
    .from('clientes')
    .select('*, veiculos(*)')
    .eq('id', id)
    .single()

  if (error || !cliente) return null

  const { data: lavagens } = await supabase
    .from('lavagens')
    .select('*, cliente:clientes(*), veiculo:veiculos(*), servico:servicos_lavagem(*)')
    .eq('cliente_id', id)
    .order('entrada_em', { ascending: false })

  return {
    ...cliente,
    total_lavagens: lavagens?.length ?? 0,
    lavagens: (lavagens ?? []) as unknown as LavagemComDetalhes[],
  } as ClienteComVeiculos & { lavagens: LavagemComDetalhes[] }
}
