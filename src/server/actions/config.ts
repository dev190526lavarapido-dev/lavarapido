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
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data: config, error } = await supabase
    .from('configuracoes_loja')
    .update(parsed.data)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/gestor/configuracoes')
  return { data: config as ConfigLoja }
}

export async function atualizarAparencia(data: {
  tema: 'claro' | 'escuro'
  paleta: 'esmeralda' | 'oceano' | 'sol-coral' | 'lavanda' | 'asfalto'
  cor_primaria: string
}): Promise<{ data?: ConfigLoja; error?: string }> {
  const parsed = aparenciaSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data: config, error } = await supabase
    .from('configuracoes_loja')
    .update(parsed.data)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/gestor/configuracoes')
  return { data: config as ConfigLoja }
}

const MIMES_LOGO_PERMITIDOS = ['image/png', 'image/jpeg', 'image/webp']
const TAMANHO_MAXIMO_LOGO = 2 * 1024 * 1024 // 2 MB

export async function uploadLogo(formData: FormData): Promise<{ data?: string; error?: string }> {
  const file = formData.get('logo') as File | null
  if (!file) return { error: 'Nenhum arquivo enviado' }

  if (!MIMES_LOGO_PERMITIDOS.includes(file.type)) {
    return { error: 'Formato inválido. Envie uma imagem PNG, JPEG ou WebP.' }
  }

  if (file.size > TAMANHO_MAXIMO_LOGO) {
    return { error: 'Arquivo muito grande. O tamanho máximo é 2 MB.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  // Path fixo por usuário: cada novo upload sobrescreve o anterior (zero acúmulo de órfãos).
  const filePath = `logos/${user.id}`

  const { error: uploadError } = await supabase.storage
    .from('loja')
    .upload(filePath, file, { upsert: true, contentType: file.type })

  if (uploadError) return { error: uploadError.message }

  const { data: publicUrl } = supabase.storage
    .from('loja')
    .getPublicUrl(filePath)

  // Cache-busting: path é fixo, então versionamos a URL pra evitar cache antigo do navegador/CDN.
  const logoUrl = `${publicUrl.publicUrl}?v=${Date.now()}`

  const { error: updateError } = await supabase
    .from('configuracoes_loja')
    .update({ logo_url: logoUrl })
    .eq('user_id', user.id)
    .select()
    .maybeSingle()

  if (updateError) return { error: updateError.message }

  revalidatePath('/gestor/configuracoes')
  return { data: logoUrl }
}
