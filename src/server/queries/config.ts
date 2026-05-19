'use server'

import { createClient } from '@/lib/supabase/server'
import type { ConfigLoja } from '@/lib/types'

export async function getConfigLoja(): Promise<ConfigLoja | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('configuracoes_loja')
    .select('*')
    .single()

  if (error) return null
  return data as ConfigLoja
}

export async function getConfigLojaPublica(): Promise<ConfigLoja | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('configuracoes_loja')
    .select('*')
    .single()

  if (error) return null
  return data as ConfigLoja
}
