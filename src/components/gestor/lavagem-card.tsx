'use client'

import { Clock, AlertTriangle, Play, CheckCircle, Key, RotateCcw } from 'lucide-react'
import { PlacaTag } from '@/components/placa-tag'
import { moneyBR } from '@/components/money'
import { STATUS_TRANSITIONS } from '@/lib/constants'
import type { LavagemStatus } from '@/lib/constants'
import type { LavagemComDetalhes } from '@/lib/types'
import { cn } from '@/lib/utils'

/* WhatsApp icon inline */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

interface LavagemCardProps {
  lavagem: LavagemComDetalhes
  onStatusChange: (lavagemId: string, novoStatus: LavagemStatus) => void
  isDragging?: boolean
  onDragStart?: () => void
  onDragEnd?: () => void
}

function getForwardStatus(status: LavagemStatus): LavagemStatus | null {
  const map: Partial<Record<LavagemStatus, LavagemStatus>> = {
    aguardando_lavagem: 'lavando',
    lavando: 'lavagem_concluida',
    lavagem_concluida: 'retirado',
    ocorrencia: 'lavando',
  }
  return map[status] ?? null
}

function getForwardLabel(fwd: LavagemStatus | null): string {
  const map: Partial<Record<LavagemStatus, string>> = {
    lavando: 'Iniciar',
    lavagem_concluida: 'Concluir',
    retirado: 'Retirar',
  }
  return (fwd && map[fwd]) ?? 'Avançar'
}

function getForwardIcon(fwd: LavagemStatus | null) {
  if (fwd === 'retirado') return <Key size={14} />
  if (fwd === 'lavando') return <Play size={14} />
  if (fwd === 'lavagem_concluida') return <CheckCircle size={14} />
  return <RotateCcw size={14} />
}

function formatHM(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export function LavagemCard({
  lavagem,
  onStatusChange,
  isDragging,
  onDragStart,
  onDragEnd,
}: LavagemCardProps) {
  const { cliente, veiculo, servico } = lavagem
  const status = lavagem.status_atual as LavagemStatus
  const transitions = STATUS_TRANSITIONS[status] ?? []
  const fwd = getForwardStatus(status)

  const isOcorrencia = status === 'ocorrencia'
  const isRetirado = status === 'retirado'

  return (
    <div
      className={cn(
        'flex flex-col gap-2.5 rounded-[14px] border border-[var(--line)] bg-[var(--surface)] p-3 cursor-pointer select-none',
        'transition-all duration-150 hover:-translate-y-px hover:shadow-[var(--shadow)]',
        isDragging && 'opacity-50',
        isOcorrencia && 'border-[color-mix(in_oklab,var(--rose)_50%,var(--line))] bg-[color-mix(in_oklab,var(--rose)_5%,var(--surface))]',
      )}
      draggable={!isRetirado}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', lavagem.id)
        onDragStart?.()
      }}
      onDragEnd={() => onDragEnd?.()}
      onClick={() => console.log('Abrir detalhe lavagem:', lavagem.id)}
    >
      {/* Placa + valor */}
      <div className="flex items-center justify-between gap-2">
        <PlacaTag placa={veiculo.placa} size="sm" />
        <span className="font-heading text-base font-bold">{moneyBR(lavagem.valor)}</span>
      </div>

      {/* Cliente + serviço */}
      <div>
        <div className="text-sm font-semibold">{cliente.nome}</div>
        <div className="text-[13px] text-[var(--ink-2)]">
          {servico.nome} · {veiculo.modelo}
        </div>
      </div>

      {/* Aviso ocorrência */}
      {isOcorrencia && lavagem.ocorrencia_descricao && (
        <div className="rounded-lg bg-[color-mix(in_oklab,var(--rose)_8%,transparent)] px-2 py-1.5 text-xs leading-snug text-[var(--rose)]">
          ⚠ {lavagem.ocorrencia_descricao}
        </div>
      )}

      {/* Hora entrada */}
      <div className="flex items-center gap-2.5 text-xs text-[var(--muted)]">
        <Clock size={12} />
        <span>{formatHM(lavagem.entrada_em)}</span>
      </div>

      {/* Ações */}
      {!isRetirado && (
        <div className="flex flex-wrap gap-1.5">
          {fwd && transitions.includes(fwd) && (
            <button
              className={cn(
                'inline-flex items-center gap-1.5 rounded-[10px] border border-transparent px-3 py-0 h-[34px] text-[13px] font-semibold cursor-pointer transition-all duration-150 active:translate-y-px',
                fwd === 'retirado'
                  ? 'bg-[var(--mint)] text-white'
                  : 'bg-[var(--brand)] text-[var(--brand-ink)] shadow-[var(--shadow-sm)]',
              )}
              onClick={(e) => {
                e.stopPropagation()
                onStatusChange(lavagem.id, fwd)
              }}
            >
              {getForwardIcon(fwd)} {getForwardLabel(fwd)}
            </button>
          )}
          {!isOcorrencia && (
            <button
              className="inline-flex items-center justify-center rounded-[10px] border border-[var(--line)] bg-[var(--surface)] h-[34px] w-[34px] cursor-pointer text-[var(--ink)] transition-colors hover:bg-[var(--bg-2)]"
              title="Marcar ocorrência"
              onClick={(e) => {
                e.stopPropagation()
                console.log('Abrir modal ocorrência:', lavagem.id)
              }}
            >
              <AlertTriangle size={14} />
            </button>
          )}
          <button
            className="inline-flex items-center justify-center rounded-[10px] border border-transparent bg-[#25D366] text-white h-[34px] w-[34px] cursor-pointer transition-colors hover:bg-[#20bd5b]"
            title="WhatsApp"
            onClick={(e) => {
              e.stopPropagation()
              console.log('Abrir WhatsApp:', lavagem.id)
            }}
          >
            <WhatsAppIcon />
          </button>
        </div>
      )}
    </div>
  )
}
