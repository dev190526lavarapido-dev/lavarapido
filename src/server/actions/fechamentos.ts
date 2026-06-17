'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Fecha (ou refaz) o consolidado do dia corrente em Brasília.
 * Chama a RPC `fechar_dia_atual`, que roda como o gestor autenticado
 * e só consolida o próprio dia. Idempotente (upsert no banco).
 */
export async function fecharDiaAtual(): Promise<{ data?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data, error } = await supabase.rpc('fechar_dia_atual')
  if (error) return { error: error.message }

  revalidatePath('/gestor/fechamentos')
  return { data: data as string }
}
