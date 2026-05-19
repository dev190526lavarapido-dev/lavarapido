'use server'

import { createClient } from '@/lib/supabase/server'

export async function getDashboardStats() {
  const supabase = await createClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayISO = today.toISOString()

  const { data: lavagens } = await supabase
    .from('lavagens')
    .select('id, status_atual, ativa, valor, entrada_em, retirada_em')

  const all = lavagens ?? []
  const entradas = all.filter(l => l.entrada_em >= todayISO)
  const aguardando = all.filter(l => l.status_atual === 'aguardando_lavagem')
  const lavando = all.filter(l => l.status_atual === 'lavando')
  const concluidas = all.filter(l => l.status_atual === 'lavagem_concluida')
  const ocorrencias = all.filter(l => l.status_atual === 'ocorrencia')
  const retirados = all.filter(l => l.status_atual === 'retirado')

  const faturamentoPrevisto = entradas.reduce((s, l) => s + Number(l.valor || 0), 0)
  const dinheiroRecebido = retirados
    .filter(l => l.retirada_em && l.retirada_em >= todayISO)
    .reduce((s, l) => s + Number(l.valor || 0), 0)

  return {
    entradas: entradas.length,
    aguardando: aguardando.length,
    lavando: lavando.length,
    concluidas: concluidas.length,
    ocorrencias: ocorrencias.length,
    retirados: retirados.length,
    faturamentoPrevisto,
    dinheiroRecebido,
  }
}
