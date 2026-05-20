'use server'

import { createClient } from '@/lib/supabase/server'
import { veiculoSchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'
import type { Veiculo } from '@/lib/types'

export async function criarVeiculo(data: {
  cliente_id: string
  placa: string
  modelo?: string
  cor?: string
}): Promise<{ data?: Veiculo; error?: string }> {
  const parsed = veiculoSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data: veiculo, error } = await supabase
    .from('veiculos')
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/gestor/clientes')
  return { data: veiculo as Veiculo }
}
