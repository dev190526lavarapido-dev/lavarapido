'use client'

import { useState, useMemo, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus } from 'lucide-react'
import { PlacaTag } from '@/components/placa-tag'
import { StatusBadge } from '@/components/status-badge'
import { waLink } from '@/lib/whatsapp'
import { criarClienteComVeiculo } from '@/server/actions/clientes'
import { createClient } from '@/lib/supabase/client'
import type { ClienteComVeiculos, Veiculo, LavagemComDetalhes } from '@/lib/types'
import type { LavagemStatus } from '@/lib/constants'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/* ============ Avatar colors ============ */
const AVATAR_COLORS = [
  'bg-[color-mix(in_oklab,var(--yellow)_35%,var(--bg))]',
  'bg-[color-mix(in_oklab,var(--brand)_30%,var(--bg))]',
  'bg-[color-mix(in_oklab,var(--mint)_30%,var(--bg))]',
  'bg-[color-mix(in_oklab,var(--sky)_30%,var(--bg))]',
  'bg-[color-mix(in_oklab,var(--rose)_28%,var(--bg))]',
]

function initials(nome: string): string {
  return nome
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function formatHM(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

/* WhatsApp icon inline */
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

/* ============ Main View ============ */

interface ClientesViewProps {
  clientes: ClienteComVeiculos[]
  totalVeiculos: number
}

export function ClientesView({ clientes, totalVeiculos }: ClientesViewProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)

  const items = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return clientes
    return clientes.filter((c) => {
      return (
        c.nome.toLowerCase().includes(q) ||
        c.whatsapp.toLowerCase().includes(q) ||
        c.veiculos.some(
          (v) =>
            v.placa.toLowerCase().includes(q) ||
            v.modelo?.toLowerCase().includes(q),
        )
      )
    })
  }, [search, clientes])

  return (
    <div>
      {/* Page head */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-[30px] font-bold leading-tight tracking-tight">
            Clientes
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-color)]">
            {clientes.length} no total, {totalVeiculos} veiculos.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-[var(--radius-btn)] bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-[var(--brand-ink)] shadow-[var(--shadow-sm)] transition-all hover:brightness-95 active:translate-y-px"
            onClick={() => setShowNew(true)}
          >
            <Plus size={16} />
            Novo cliente
          </button>
        </div>
      </div>

      {/* Search pill */}
      <div className="mb-3.5 flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2">
        <Search size={16} className="text-[var(--muted)]" />
        <input
          className="flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-[var(--muted)]"
          placeholder="Buscar por nome, placa ou WhatsApp..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Row list */}
      <div className="flex flex-col gap-1.5">
        {items.map((c, i) => (
          <button
            key={c.id}
            type="button"
            className="flex w-full items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3 text-left transition-colors hover:bg-[var(--surface-2)]"
            onClick={() => setSelectedId(c.id)}
          >
            {/* Avatar */}
            <div
              className={`flex h-10 w-10 flex-none items-center justify-center rounded-xl text-sm font-bold text-[var(--ink)] ${AVATAR_COLORS[i % 5]}`}
            >
              {initials(c.nome)}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">{c.nome}</div>
              <div className="font-mono text-xs text-[var(--muted)]">
                {c.whatsapp}
              </div>
              {c.veiculos.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {c.veiculos.map((v) => (
                    <PlacaTag key={v.id} placa={v.placa} size="sm" />
                  ))}
                </div>
              )}
            </div>

            {/* Lavagens count */}
            <div className="flex-none text-right text-xs text-[var(--muted)]">
              {c.total_lavagens} lavagens
            </div>
          </button>
        ))}
        {items.length === 0 && (
          <div className="py-6 text-center text-sm text-[var(--muted)]">
            Ninguem aqui ainda.
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedId && (
        <ClienteDetalheModal
          clienteId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
      {showNew && (
        <NovoClienteModal
          onClose={() => {
            setShowNew(false)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}

/* ============ Cliente Detalhe Modal ============ */

interface ClienteDetalheModalProps {
  clienteId: string
  onClose: () => void
}

function ClienteDetalheModal({ clienteId, onClose }: ClienteDetalheModalProps) {
  const [cliente, setCliente] = useState<{
    nome: string
    whatsapp: string
    veiculos: Veiculo[]
    lavagens: (LavagemComDetalhes)[]
  } | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch client details via browser client
  useEffect(() => {
    let cancelled = false
    const supabase = createClient()
    async function load() {
      const { data: c } = await supabase
        .from('clientes')
        .select('id, nome, whatsapp')
        .eq('id', clienteId)
        .single()

      if (!c || cancelled) {
        if (!cancelled) setLoading(false)
        return
      }

      const { data: veiculos } = await supabase
        .from('veiculos')
        .select('*')
        .eq('cliente_id', clienteId)

      const { data: lavagens } = await supabase
        .from('lavagens')
        .select('*, veiculo:veiculos(*), servico:servicos_lavagem(*), cliente:clientes(*)')
        .eq('cliente_id', clienteId)
        .order('entrada_em', { ascending: false })

      if (!cancelled) {
        setCliente({
          nome: c.nome,
          whatsapp: c.whatsapp,
          veiculos: (veiculos ?? []) as Veiculo[],
          lavagens: (lavagens ?? []) as unknown as LavagemComDetalhes[],
        })
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [clienteId])

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        {loading || !cliente ? (
          <div className="py-8 text-center text-sm text-[var(--muted)]">
            Carregando...
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{cliente.nome}</DialogTitle>
              <DialogDescription className="sr-only">
                Detalhes do cliente
              </DialogDescription>
            </DialogHeader>

            {/* WhatsApp row */}
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm text-[var(--muted)]">
                {cliente.whatsapp}
              </span>
              <a
                href={waLink(cliente.whatsapp, 'Oi! Tudo bem?')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
              >
                <WhatsAppIcon />
                WhatsApp
              </a>
            </div>

            {/* Veiculos */}
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                Veiculos
              </h3>
              <div className="flex flex-col gap-2">
                {cliente.veiculos.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between rounded-xl border border-[var(--line)] px-3 py-2.5"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <PlacaTag placa={v.placa} size="sm" />
                        <span className="text-sm font-semibold">
                          {v.modelo}
                        </span>
                      </div>
                      {v.cor && (
                        <div className="mt-1 text-xs text-[var(--muted)]">
                          {v.cor}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Historico */}
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                Historico
              </h3>
              <div className="flex flex-col gap-2">
                {cliente.lavagens.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    className="flex w-full items-center justify-between rounded-xl border border-[var(--line)] px-3 py-2.5 text-left transition-colors hover:bg-[var(--surface-2)]"
                    onClick={() => {
                      onClose()
                      window.location.href = '/gestor/lavagens'
                    }}
                  >
                    <div>
                      <div className="text-[13px] font-semibold">
                        {l.servico?.nome}
                      </div>
                      <div className="text-xs text-[var(--muted)]">
                        {l.veiculo?.placa} · {formatHM(l.entrada_em)}
                      </div>
                    </div>
                    <StatusBadge
                      status={l.status_atual as LavagemStatus}
                      size="sm"
                    />
                  </button>
                ))}
                {cliente.lavagens.length === 0 && (
                  <div className="py-3 text-center text-[13px] text-[var(--muted)]">
                    Sem historico ainda.
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

/* ============ Novo Cliente Modal ============ */

interface NovoClienteModalProps {
  onClose: () => void
}

function NovoClienteModal({ onClose }: NovoClienteModalProps) {
  const [isPending, startTransition] = useTransition()
  const [cli, setCli] = useState({ nome: '', whatsapp: '' })
  const [vei, setVei] = useState({ placa: '', modelo: '', cor: '' })
  const [error, setError] = useState<string | null>(null)

  const ok = cli.nome.trim() && cli.whatsapp.trim() && vei.placa.trim()

  function handleSave() {
    if (!ok) return
    setError(null)
    startTransition(async () => {
      const result = await criarClienteComVeiculo(
        { nome: cli.nome.trim(), whatsapp: cli.whatsapp.trim() },
        {
          placa: vei.placa.toUpperCase().trim(),
          modelo: vei.modelo.trim() || undefined,
          cor: vei.cor.trim() || undefined,
        },
      )
      if (result.error) {
        setError(result.error)
        return
      }
      onClose()
    })
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo cliente</DialogTitle>
          <DialogDescription className="sr-only">
            Cadastrar novo cliente com veiculo
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={cli.nome}
              onChange={(e) => setCli({ ...cli, nome: e.target.value })}
              placeholder="Ex: Marcelo Andrade"
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              className="font-mono"
              value={cli.whatsapp}
              onChange={(e) => setCli({ ...cli, whatsapp: e.target.value })}
              placeholder="+55 11 9..."
            />
          </div>
          <div className="flex gap-2.5">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="placa">Placa</Label>
              <Input
                id="placa"
                className="font-mono uppercase"
                value={vei.placa}
                onChange={(e) =>
                  setVei({ ...vei, placa: e.target.value.toUpperCase() })
                }
                placeholder="ABC1D23"
              />
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="cor">Cor</Label>
              <Input
                id="cor"
                value={vei.cor}
                onChange={(e) => setVei({ ...vei, cor: e.target.value })}
                placeholder="Prata"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="modelo">Modelo</Label>
            <Input
              id="modelo"
              value={vei.modelo}
              onChange={(e) => setVei({ ...vei, modelo: e.target.value })}
              placeholder="Honda Civic"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!ok || isPending}
          >
            {isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
