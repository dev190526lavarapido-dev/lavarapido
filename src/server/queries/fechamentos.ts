'use server'

import { createClient } from '@/lib/supabase/server'
import type { FechamentoDiario } from '@/lib/types'

export async function getFechamentos(): Promise<FechamentoDiario[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('fechamentos_diarios')
    .select('*')
    .order('data', { ascending: false })

  if (error) return []
  return (data ?? []) as unknown as FechamentoDiario[]
}

export async function getFechamento(data: string): Promise<FechamentoDiario | null> {
  const supabase = await createClient()

  const { data: row, error } = await supabase
    .from('fechamentos_diarios')
    .select('*')
    .eq('data', data)
    .maybeSingle()

  if (error || !row) return null
  return row as unknown as FechamentoDiario
}
