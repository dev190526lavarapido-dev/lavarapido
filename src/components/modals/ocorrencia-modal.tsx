'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, X } from 'lucide-react'
import { registrarOcorrencia } from '@/server/actions/lavagens'

const SUGESTOES = [
  'Cliente esqueceu a chave',
  'Carro precisa de produto especial',
  'Cliente precisa confirmar serviço extra',
  'Serviço pausado por problema interno',
]

interface OcorrenciaModalProps {
  lavagemId: string | null
  descricaoAtual?: string
  onClose: () => void
  onWhatsApp?: () => void
}

export function OcorrenciaModal({ lavagemId, descricaoAtual, onClose, onWhatsApp }: OcorrenciaModalProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [desc, setDesc] = useState(descricaoAtual || '')
  const [error, setError] = useState<string | null>(null)

  if (!lavagemId) return null

  const handleSalvar = () => {
    if (!desc.trim()) return
    setError(null)
    startTransition(async () => {
      const result = await registrarOcorrencia(lavagemId, desc.trim())
      if (result.error) {
        setError(result.error)
        return
      }
      router.refresh()
      onClose()
      onWhatsApp?.()
    })
  }

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-end sm:place-items-center bg-black/45 animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-[520px] max-h-[92dvh] overflow-auto rounded-t-[22px] sm:rounded-[22px] bg-[var(--surface)] p-[18px] pb-[22px] shadow-[var(--shadow-lg)] animate-in slide-in-from-bottom-5 duration-250">
        {/* Grab bar mobile */}
        <div className="mx-auto mb-2.5 h-1 w-10 rounded-full bg-[var(--line)] sm:hidden" />

        {/* Header */}
        <div className="mb-2.5 flex items-center justify-between gap-3">
          <h2 className="font-heading text-[22px] font-bold tracking-tight">Marcar ocorrência</h2>
          <button
            className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] transition-colors hover:bg-[var(--bg-2)]"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        {/* Hint */}
        <p className="mt-2 text-[13px] text-muted-foreground">
          O cliente vai ver essa descrição na página de acompanhamento.
        </p>

        {/* Textarea */}
        <textarea
          className="mt-2 w-full resize-y rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 py-3 text-[15px] text-[var(--ink)] outline-none transition-all min-h-[88px] focus:border-[var(--brand)] focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--brand)_22%,transparent)] placeholder:text-muted-foreground"
          autoFocus
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="O que aconteceu?"
        />

        {/* Sugestoes rapidas */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {SUGESTOES.map((s) => (
            <button
              key={s}
              className="inline-flex h-[34px] items-center rounded-[10px] border border-[var(--line)] bg-[var(--surface)] px-3 text-[13px] font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--bg-2)]"
              onClick={() => setDesc(s)}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Erro */}
        {error && <p className="mt-2 text-xs text-[var(--rose)]">{error}</p>}

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-btn)] px-4 text-sm font-semibold text-[var(--ink-2)] transition-all hover:bg-[var(--bg-2)]"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-btn)] bg-[var(--rose)] px-4 text-sm font-semibold text-white transition-all hover:brightness-95 active:translate-y-px disabled:pointer-events-none disabled:opacity-50"
            disabled={!desc.trim() || isPending}
            onClick={handleSalvar}
          >
            <AlertTriangle size={16} />
            {isPending ? 'Registrando...' : 'Registrar ocorrência'}
          </button>
        </div>
      </div>
    </div>
  )
}
