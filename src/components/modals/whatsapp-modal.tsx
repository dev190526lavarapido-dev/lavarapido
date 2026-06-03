'use client'

import { useState, useCallback, useEffect } from 'react'
import { X } from 'lucide-react'
import type { LavagemComDetalhes, ConfigLoja } from '@/lib/types'
import { DEFAULT_TEMPLATES } from '@/lib/constants'
import {
  waLink,
  buildWaMessage,
  tituloPorTipo,
} from '@/lib/whatsapp'
import { registrarMensagem } from '@/server/actions/whatsapp'

/* WhatsApp icon inline */
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

const PRESETS = [
  { key: 'entrada', label: 'Entrada' },
  { key: 'lavando', label: 'Lavando' },
  { key: 'concluida', label: 'Pronto' },
  { key: 'aguardando', label: 'Fila' },
  { key: 'ocorrencia', label: 'Ocorrencia' },
  { key: 'retirado', label: 'Retirado' },
  { key: 'manual', label: 'Outro' },
] as const

interface WhatsAppModalProps {
  lavagem: LavagemComDetalhes | null
  tipo: string
  loja: ConfigLoja | null
  onClose: () => void
}

export function WhatsAppModal({ lavagem, tipo: tipoProp, loja, onClose }: WhatsAppModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const buildMsg = useCallback(
    (t: string) => {
      if (!lavagem || !loja) return ''
      const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/a/${lavagem.token_publico}`
      const templates = { ...DEFAULT_TEMPLATES, ...(loja.mensagens_etapas || {}) }
      return buildWaMessage(t, {
        clienteNome: lavagem.cliente.nome,
        placa: lavagem.veiculo.placa,
        servicoNome: lavagem.servico.nome,
        lojaNome: loja.nome_loja,
        link,
        descricao: lavagem.ocorrencia_descricao || '',
        templates,
      })
    },
    [lavagem, loja],
  )

  const [activeTipo, setActiveTipo] = useState(tipoProp)
  const [msg, setMsg] = useState(() => buildMsg(tipoProp))
  // Track external key to reset when props change.
  // canBuild entra na chave para regenerar a mensagem quando loja/lavagem
  // carregam depois do modal já aberto (buildMsg passa de '' pra texto real),
  // sem precisar de setState dentro de useEffect.
  const canBuild = !!lavagem && !!loja
  const [prevKey, setPrevKey] = useState(`${tipoProp}-${lavagem?.id}-${canBuild}`)
  const currentKey = `${tipoProp}-${lavagem?.id}-${canBuild}`
  if (prevKey !== currentKey) {
    setPrevKey(currentKey)
    setActiveTipo(tipoProp)
    setMsg(buildMsg(tipoProp))
  }

  const handlePreset = (t: string) => {
    setActiveTipo(t)
    setMsg(buildMsg(t))
  }

  const handleOpen = async () => {
    if (!lavagem) return
    const link = `${window.location.origin}/a/${lavagem.token_publico}`
    const url = waLink(lavagem.cliente.whatsapp, msg)
    window.open(url, '_blank')
    // Register message (fire and forget)
    registrarMensagem(lavagem.id, activeTipo, msg, link).catch(() => {})
    onClose()
  }

  if (!lavagem || !loja) return null

  const { cliente } = lavagem

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-end sm:place-items-center bg-black/45 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-[520px] max-h-[92dvh] overflow-auto rounded-t-[22px] sm:rounded-[22px] bg-[var(--surface)] p-[18px] pb-[22px] shadow-[var(--shadow-lg)] animate-in slide-in-from-bottom-5 duration-250">
        {/* Grab bar mobile */}
        <div className="mx-auto mb-2.5 h-1 w-10 rounded-full bg-[var(--line)] sm:hidden" />

        {/* Header */}
        <div className="mb-2.5 flex items-center justify-between gap-3">
          <h2 className="font-heading text-[22px] font-bold tracking-tight">
            {tituloPorTipo(activeTipo)}
          </h2>
          <button
            className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] transition-colors hover:bg-[var(--bg-2)]"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        {/* Info cliente */}
        <div className="mb-3 flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--bg-2)] font-heading text-sm font-bold">
            {initials(cliente.nome)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">{cliente.nome}</div>
            <div className="font-mono text-xs text-muted-foreground">{cliente.whatsapp}</div>
          </div>
        </div>

        {/* Preset chips */}
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              className={`inline-flex h-[34px] items-center rounded-[10px] px-3 text-[13px] font-semibold transition-all cursor-pointer ${
                p.key === activeTipo
                  ? 'bg-[var(--brand)] text-[var(--brand-ink)] border border-transparent'
                  : 'bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] hover:bg-[var(--bg-2)]'
              }`}
              onClick={() => handlePreset(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* WhatsApp preview */}
        <div className="wa-chat">
          <div className="wa-bubble">
            {msg}
            <span className="time">
              {new Date().toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        {/* Textarea */}
        <div className="mt-4 flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-[var(--ink-2)]">Editar mensagem</label>
          <textarea
            className="w-full resize-y rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 py-3 text-[15px] text-[var(--ink)] outline-none transition-all min-h-[88px] focus:border-[var(--brand)] focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--brand)_22%,transparent)] placeholder:text-muted-foreground"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            rows={6}
          />
        </div>

        {/* Hint */}
        <div className="mt-2 text-xs text-muted-foreground">
          Lembrando: <strong>wa.me</strong> abre o WhatsApp com a mensagem pronta — você precisa clicar em enviar lá.
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-btn)] px-4 text-sm font-semibold text-[var(--ink-2)] transition-all hover:bg-[var(--bg-2)] cursor-pointer"
            onClick={onClose}
          >
            Pular aviso
          </button>
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-btn)] bg-[#25D366] px-4 text-sm font-semibold text-white transition-all hover:bg-[#20bd5b] active:translate-y-px cursor-pointer"
            onClick={handleOpen}
          >
            <WhatsAppIcon />
            Abrir no WhatsApp
          </button>
        </div>
      </div>
    </div>
  )
}
