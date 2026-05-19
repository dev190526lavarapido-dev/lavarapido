'use server'

import { createClient } from '@/lib/supabase/server'
import { configLojaSchema, aparenciaSchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'
import type { ConfigLoja } from '@/lib/types'

export async function atualizarConfigLoja(data: {
  nome_loja: string
  descricao?: string
  telefone?: string
  whatsapp?: string
  endereco_texto?: string
  maps_url?: string
  horario_funcionamento?: string
  instagram_url?: string
  mensagem_whatsapp_padrao?: string
  mensagens_etapas?: Record<string, string>
}): Promise<{ data?: ConfigLoja; error?: string }> {
  const parsed = configLojaSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }
  }

  const supabase = await createClient()
  const { data: config, error } = await supabase
    .from('configuracoes_loja')
    .update(parsed.data)
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/gestor/configuracoes')
  return { data: config as ConfigLoja }
}

export async function atualizarAparencia(data: {
  tema: 'claro' | 'escuro'
  cor_primaria: string
}): Promise<{ data?: ConfigLoja; error?: string }> {
  const parsed = aparenciaSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }
  }

  const supabase = await createClient()
  const { data: config, error } = await supabase
    .from('configuracoes_loja')
    .update(parsed.data)
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/gestor/configuracoes')
  return { data: config as ConfigLoja }
}

export async function uploadLogo(formData: FormData): Promise<{ data?: string; error?: string }> {
  const file = formData.get('logo') as File | null
  if (!file) return { error: 'Nenhum arquivo enviado' }

  const supabase = await createClient()

  const ext = file.name.split('.').pop()
  const fileName = `logo_${Date.now()}.${ext}`
  const filePath = `logos/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('loja')
    .upload(filePath, file, { upsert: true })

  if (uploadError) return { error: uploadError.message }

  const { data: publicUrl } = supabase.storage
    .from('loja')
    .getPublicUrl(filePath)

  const { error: updateError } = await supabase
    .from('configuracoes_loja')
    .update({ logo_url: publicUrl.publicUrl })
    .select()
    .single()

  if (updateError) return { error: updateError.message }

  revalidatePath('/gestor/configuracoes')
  return { data: publicUrl.publicUrl }
}
