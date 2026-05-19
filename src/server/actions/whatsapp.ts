'use server'

import { createClient } from '@/lib/supabase/server'
import type { MensagemWhatsapp } from '@/lib/types'

export async function registrarMensagem(
  lavagemId: string,
  tipo: string,
  mensagem: string,
  link: string
): Promise<{ data?: MensagemWhatsapp; error?: string }> {
  if (!lavagemId || !tipo || !mensagem) {
    return { error: 'Dados obrigatórios faltando' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mensagens_whatsapp')
    .insert({
      lavagem_id: lavagemId,
      tipo,
      mensagem,
      link,
    })
    .select()
    .single()

  if (error) return { error: error.message }
  return { data: data as MensagemWhatsapp }
}
