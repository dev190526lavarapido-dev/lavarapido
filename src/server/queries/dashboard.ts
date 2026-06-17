'use server'

import { createClient } from '@/lib/supabase/server'
import { inicioDiaBrasiliaISO } from '@/lib/datas'

export async function getDashboardStats() {
  const supabase = await createClient()

  // Fronteira do dia em Brasília (00:00 -03) — não no fuso do servidor (UTC).
  const todayISO = inicioDiaBrasiliaISO()

  const lavagens = () => supabase.from('lavagens')

  const [
    entradasCount,
    aguardandoCount,
    lavandoCount,
    concluidasCount,
    ocorrenciasCount,
    retiradosCount,
    entradasHoje,
    retiradosHoje,
  ] = await Promise.all([
    lavagens().select('*', { count: 'exact', head: true }).gte('entrada_em', todayISO),
    lavagens().select('*', { count: 'exact', head: true }).eq('status_atual', 'aguardando_lavagem'),
    lavagens().select('*', { count: 'exact', head: true }).eq('status_atual', 'lavando'),
    lavagens().select('*', { count: 'exact', head: true }).eq('status_atual', 'lavagem_concluida'),
    lavagens().select('*', { count: 'exact', head: true }).eq('status_atual', 'ocorrencia'),
    lavagens().select('*', { count: 'exact', head: true }).eq('status_atual', 'retirado'),
    lavagens().select('valor').gte('entrada_em', todayISO),
    lavagens().select('valor').eq('status_atual', 'retirado').gte('retirada_em', todayISO),
  ])

  const faturamentoPrevisto = (entradasHoje.data ?? []).reduce(
    (s, l) => s + Number(l.valor || 0),
    0,
  )
  const dinheiroRecebido = (retiradosHoje.data ?? []).reduce(
    (s, l) => s + Number(l.valor || 0),
    0,
  )

  return {
    entradas: entradasCount.count ?? 0,
    aguardando: aguardandoCount.count ?? 0,
    lavando: lavandoCount.count ?? 0,
    concluidas: concluidasCount.count ?? 0,
    ocorrencias: ocorrenciasCount.count ?? 0,
    retirados: retiradosCount.count ?? 0,
    faturamentoPrevisto,
    dinheiroRecebido,
  }
}
