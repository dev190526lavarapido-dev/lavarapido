'use client'

import { useState, useEffect, useCallback, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  X, Droplet, Check, Key, RotateCcw, AlertTriangle, Copy, ExternalLink, Edit,
} from 'lucide-react'
import { StatusBadge } from '@/components/status-badge'
import { PlacaTag } from '@/components/placa-tag'
import { Timeline } from '@/components/timeline'
import { moneyBR } from '@/components/money'
import { waLink } from '@/lib/whatsapp'
import { STATUS_TRANSITIONS } from '@/lib/constants'
import type { LavagemStatus } from '@/lib/constants'
import type { LavagemComDetalhes, EventoLavagem } from '@/lib/types'
import { mudarStatus } from '@/server/actions/lavagens'
import { createClient } from '@/lib/supabase/client'
import { OcorrenciaModal } from './ocorrencia-modal'

/* WhatsApp icon inline */
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function formatHM(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

interface LavagemDetalheModalProps {
  lavagem: LavagemComDetalhes | null
  onClose: () => void
  onOcorrencia?: (lavagemId: string, descricaoAtual?: string) => void
}

export function LavagemDetalheModal({ lavagem, onClose, onOcorrencia }: LavagemDetalheModalProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [eventos, setEventos] = useState<EventoLavagem[]>([])
  const [loadingEventos, setLoadingEventos] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showOcorrenciaInterna, setShowOcorrenciaInterna] = useState(false)

  // Fetch eventos when lavagem changes
  const lavagemId = lavagem?.id ?? null
  useEffect(() => {
    if (!lavagemId) return

    let cancelled = false

    const fetchEventos = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('eventos_lavagem')
        .select('*')
        .eq('lavagem_id', lavagemId)
        .order('created_at', { ascending: true })
      if (!cancelled) {
        setEventos((data ?? []) as EventoLavagem[])
        setLoadingEventos(false)
      }
    }
    // Use a microtask to set loading state to avoid sync setState in effect
    Promise.resolve().then(() => {
      if (!cancelled) setLoadingEventos(true)
    })
    fetchEventos()
    return () => { cancelled = true }
  }, [lavagemId])

  const handleStatusChange = useCallback((novoStatus: LavagemStatus) => {
    if (!lavagem) return
    startTransition(async () => {
      const result = await mudarStatus(lavagem.id, novoStatus)
      if (result.error) {
        console.error('Erro ao mudar status:', result.error)
        return
      }
      router.refresh()
      onClose()
    })
  }, [lavagem, router, onClose])

  const handleCopy = useCallback(() => {
    if (!lavagem) return
    const url = `${window.location.origin}/a/${lavagem.token_publico}`
    navigator.clipboard?.writeText(url).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [lavagem])

  const handleOpenOcorrencia = useCallback(() => {
    if (!lavagem) return
    if (onOcorrencia) {
      onOcorrencia(lavagem.id, lavagem.ocorrencia_descricao || undefined)
    } else {
      setShowOcorrenciaInterna(true)
    }
  }, [lavagem, onOcorrencia])

  if (!lavagem) return null

  const { cliente, veiculo, servico } = lavagem
  const status = lavagem.status_atual as LavagemStatus
  const transitions = STATUS_TRANSITIONS[status] ?? []
  const pubUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/a/${lavagem.token_publico}`

  return (
    <>
      <div
        className="fixed inset-0 z-[80] grid place-items-end sm:place-items-center bg-black/45 animate-in fade-in duration-200"
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        <div
          className="w-full max-w-[520px] max-h-[92dvh] overflow-auto rounded-t-[22px] sm:rounded-[22px] bg-[var(--surface)] p-[18px] pb-[22px] shadow-[var(--shadow-lg)] animate-in slide-in-from-bottom-5 duration-250"
          style={isPending ? { opacity: 0.7, pointerEvents: 'none' } : undefined}
        >
          {/* Grab bar mobile */}
          <div className="mx-auto mb-2.5 h-1 w-10 rounded-full bg-[var(--line)] sm:hidden" />

          {/* Header */}
          <div className="mb-2.5 flex items-center justify-between gap-3">
            <h2 className="font-heading text-[22px] font-bold tracking-tight">
              Lavagem &middot; {veiculo.placa}
            </h2>
            <button
              className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] transition-colors hover:bg-[var(--bg-2)]"
              onClick={onClose}
            >
              <X size={16} />
            </button>
          </div>

          {/* Status + entrada */}
          <div className="mb-2.5 flex items-center justify-between">
            <StatusBadge status={status} />
            <span className="font-mono text-xs text-[var(--muted)]">
              Entrada {formatHM(lavagem.entrada_em)}
            </span>
          </div>

          {/* Info principal */}
          <div className="flex flex-wrap items-center gap-3">
            <PlacaTag placa={veiculo.placa} size="big" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold">{cliente.nome}</div>
              <div className="font-mono text-xs text-[var(--muted)]">{cliente.whatsapp}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[var(--muted)]">{veiculo.modelo} &middot; {veiculo.cor}</div>
              <div className="font-heading text-[22px] font-bold">{moneyBR(lavagem.valor)}</div>
            </div>
          </div>

          {/* Servico */}
          <div className="mt-2 text-[13px] text-[var(--muted)]">
            {servico.nome} &mdash; {servico.descricao}
          </div>

          {/* Observacao */}
          {lavagem.observacao && (
            <div className="mt-2 rounded-[10px] bg-[var(--bg-2)] px-3 py-2 text-[13px]">
              <span className="mr-1">&#128221;</span> {lavagem.observacao}
            </div>
          )}

          {/* Ocorrencia */}
          {status === 'ocorrencia' && lavagem.ocorrencia_descricao && (
            <div
              className="mt-2 rounded-[10px] px-3 py-2.5 text-[13px] font-medium"
              style={{
                background: 'color-mix(in oklab, var(--rose) 10%, transparent)',
                color: 'var(--rose)',
              }}
            >
              <span className="mr-1">&#9888;</span> {lavagem.ocorrencia_descricao}
            </div>
          )}

          {/* Acoes */}
          <div className="mt-4">
            <h3 className="mb-2 text-[14px] font-semibold uppercase tracking-wider text-[var(--muted)]">
              Acoes
            </h3>

            {/* Acoes por status */}
            {status === 'retirado' ? (
              <div className="text-sm text-[var(--muted)]">
                Lavagem encerrada &middot; {lavagem.retirada_em ? formatHM(lavagem.retirada_em) : '--:--'}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {/* aguardando_lavagem */}
                {status === 'aguardando_lavagem' && (
                  <>
                    <ActionBtn
                      kind="primary"
                      icon={<Droplet size={16} />}
                      onClick={() => handleStatusChange('lavando')}
                    >
                      Iniciar lavagem
                    </ActionBtn>
                    <ActionBtn
                      icon={<AlertTriangle size={16} />}
                      onClick={handleOpenOcorrencia}
                    >
                      Marcar ocorrencia
                    </ActionBtn>
                  </>
                )}

                {/* lavando */}
                {status === 'lavando' && (
                  <>
                    <ActionBtn
                      kind="success"
                      icon={<Check size={16} />}
                      onClick={() => handleStatusChange('lavagem_concluida')}
                    >
                      Concluir lavagem
                    </ActionBtn>
                    {transitions.includes('aguardando_lavagem') && (
                      <ActionBtn
                        icon={<RotateCcw size={16} />}
                        onClick={() => handleStatusChange('aguardando_lavagem')}
                      >
                        Voltar pra aguardando
                      </ActionBtn>
                    )}
                    <ActionBtn
                      icon={<AlertTriangle size={16} />}
                      onClick={handleOpenOcorrencia}
                    >
                      Marcar ocorrencia
                    </ActionBtn>
                  </>
                )}

                {/* lavagem_concluida */}
                {status === 'lavagem_concluida' && (
                  <>
                    <ActionBtn
                      kind="primary"
                      icon={<Key size={16} />}
                      onClick={() => handleStatusChange('retirado')}
                    >
                      Marcar como retirado
                    </ActionBtn>
                    <ActionBtn
                      icon={<AlertTriangle size={16} />}
                      onClick={handleOpenOcorrencia}
                    >
                      Marcar ocorrencia
                    </ActionBtn>
                  </>
                )}

                {/* ocorrencia */}
                {status === 'ocorrencia' && (
                  <>
                    {transitions.includes('lavando') && (
                      <ActionBtn
                        kind="primary"
                        icon={<Droplet size={16} />}
                        onClick={() => handleStatusChange('lavando')}
                      >
                        Retomar lavagem
                      </ActionBtn>
                    )}
                    {transitions.includes('aguardando_lavagem') && (
                      <ActionBtn
                        icon={<RotateCcw size={16} />}
                        onClick={() => handleStatusChange('aguardando_lavagem')}
                      >
                        Voltar pra aguardando
                      </ActionBtn>
                    )}
                    <ActionBtn
                      icon={<Edit size={16} />}
                      onClick={handleOpenOcorrencia}
                    >
                      Editar ocorrencia
                    </ActionBtn>
                  </>
                )}
              </div>
            )}

            {/* Botoes gerais */}
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={waLink(cliente.whatsapp, `Oi ${cliente.nome.split(' ')[0]}, sobre seu ${veiculo.placa}...`)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-btn)] bg-[#25D366] px-4 text-sm font-semibold text-white transition-all hover:bg-[#20bd5b] active:translate-y-px"
              >
                <WhatsAppIcon />
                Avisar cliente no WhatsApp
              </a>
              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-btn)] border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--ink)] transition-all hover:bg-[var(--bg-2)] active:translate-y-px"
                onClick={handleCopy}
              >
                <Copy size={16} />
                {copied ? 'Link copiado!' : 'Copiar link do cliente'}
              </button>
              <a
                href={pubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-btn)] border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--ink)] transition-all hover:bg-[var(--bg-2)] active:translate-y-px"
              >
                <ExternalLink size={16} />
                Abrir como cliente
              </a>
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-6">
            <h3 className="mb-2 text-[14px] font-semibold uppercase tracking-wider text-[var(--muted)]">
              Linha do tempo
            </h3>
            {loadingEventos ? (
              <div className="py-4 text-center text-xs text-[var(--muted)]">Carregando...</div>
            ) : eventos.length === 0 ? (
              <div className="py-4 text-center text-xs text-[var(--muted)]">Nenhum evento</div>
            ) : (
              <Timeline eventos={eventos} />
            )}
          </div>
        </div>
      </div>

      {/* Ocorrencia modal interno (fallback se pai nao gerencia) */}
      {showOcorrenciaInterna && (
        <OcorrenciaModal
          lavagemId={lavagem.id}
          descricaoAtual={lavagem.ocorrencia_descricao || undefined}
          onClose={() => {
            setShowOcorrenciaInterna(false)
            router.refresh()
            onClose()
          }}
        />
      )}
    </>
  )
}

/* ============ Action button helper ============ */

function ActionBtn({
  kind,
  icon,
  onClick,
  children,
}: {
  kind?: 'primary' | 'success' | 'danger'
  icon?: React.ReactNode
  onClick: () => void
  children: React.ReactNode
}) {
  const base =
    'inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-btn)] px-4 text-sm font-semibold transition-all active:translate-y-px cursor-pointer'

  const variants: Record<string, string> = {
    primary: 'bg-[var(--brand)] text-[var(--brand-ink)] border-transparent shadow-[var(--shadow-sm)]',
    success: 'bg-[var(--mint)] text-white border-transparent',
    danger: 'bg-[var(--rose)] text-white border-transparent',
    default: 'bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] hover:bg-[var(--bg-2)]',
  }

  return (
    <button className={`${base} ${variants[kind ?? 'default']}`} onClick={onClick}>
      {icon}
      {children}
    </button>
  )
}
