'use client'

import { useState, useMemo, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, Pencil, Trash2, Check, Car } from 'lucide-react'
import { PlacaTag } from '@/components/placa-tag'
import { StatusBadge } from '@/components/status-badge'
import { waLink } from '@/lib/whatsapp'
import { moneyBR } from '@/components/money'
import {
  criarClienteComVeiculo,
  atualizarCliente,
  atualizarVeiculo,
  adicionarVeiculo,
  removerVeiculo,
} from '@/server/actions/clientes'
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
    const filtered = !q
      ? clientes
      : clientes.filter((c) => {
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
    return [...filtered].sort((a, b) => a.nome.localeCompare(b.nome))
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
        <Search size={16} className="text-muted-foreground" />
        <input
          className="flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
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
              <div className="font-mono text-xs text-muted-foreground">
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
            <div className="flex-none text-right text-xs text-muted-foreground">
              {c.total_lavagens} lavagens
            </div>
          </button>
        ))}
        {items.length === 0 && (
          <div className="py-6 text-center text-sm text-muted-foreground">
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

interface ClienteDetalheData {
  id: string
  nome: string
  whatsapp: string
  veiculos: Veiculo[]
  lavagens: LavagemComDetalhes[]
}

function ClienteDetalheModal({ clienteId, onClose }: ClienteDetalheModalProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [cliente, setCliente] = useState<ClienteDetalheData | null>(null)
  const [loading, setLoading] = useState(true)

  // Edição perfil
  const [editingPerfil, setEditingPerfil] = useState(false)
  const [perfilForm, setPerfilForm] = useState({ nome: '', whatsapp: '' })
  const [perfilError, setPerfilError] = useState('')

  // Edição veículo
  const [editingVeiculoId, setEditingVeiculoId] = useState<string | null>(null)
  const [veiculoForm, setVeiculoForm] = useState({ placa: '', modelo: '', cor: '' })
  const [veiculoError, setVeiculoError] = useState('')

  // Novo veículo
  const [addingVeiculo, setAddingVeiculo] = useState(false)
  const [novoVeiculoForm, setNovoVeiculoForm] = useState({ placa: '', modelo: '', cor: '' })

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
          id: c.id,
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

  const handleSavePerfil = () => {
    if (!perfilForm.nome.trim() || !perfilForm.whatsapp.trim()) {
      setPerfilError('Nome e WhatsApp são obrigatórios.')
      return
    }
    setPerfilError('')
    startTransition(async () => {
      const result = await atualizarCliente(clienteId, {
        nome: perfilForm.nome.trim(),
        whatsapp: perfilForm.whatsapp.trim(),
      })
      if (result.error) {
        setPerfilError(result.error)
        return
      }
      setCliente((prev) =>
        prev ? { ...prev, nome: perfilForm.nome.trim(), whatsapp: perfilForm.whatsapp.trim() } : prev
      )
      setEditingPerfil(false)
      router.refresh()
    })
  }

  const handleSaveVeiculo = (veiculoId: string) => {
    if (!veiculoForm.placa.trim()) {
      setVeiculoError('Placa é obrigatória.')
      return
    }
    setVeiculoError('')
    startTransition(async () => {
      const result = await atualizarVeiculo(veiculoId, {
        placa: veiculoForm.placa.trim(),
        modelo: veiculoForm.modelo.trim(),
        cor: veiculoForm.cor.trim(),
      })
      if (result.error) {
        setVeiculoError(result.error)
        return
      }
      setCliente((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          veiculos: prev.veiculos.map((v) =>
            v.id === veiculoId
              ? { ...v, placa: veiculoForm.placa.toUpperCase().trim(), modelo: veiculoForm.modelo.trim(), cor: veiculoForm.cor.trim() }
              : v
          ),
        }
      })
      setEditingVeiculoId(null)
      router.refresh()
    })
  }

  const handleAddVeiculo = () => {
    if (!novoVeiculoForm.placa.trim()) {
      setVeiculoError('Placa é obrigatória.')
      return
    }
    setVeiculoError('')
    startTransition(async () => {
      const result = await adicionarVeiculo(clienteId, {
        placa: novoVeiculoForm.placa.trim(),
        modelo: novoVeiculoForm.modelo.trim(),
        cor: novoVeiculoForm.cor.trim(),
      })
      if (result.error) {
        setVeiculoError(result.error)
        return
      }
      if (result.data) {
        setCliente((prev) =>
          prev ? { ...prev, veiculos: [...prev.veiculos, result.data!] } : prev
        )
      }
      setNovoVeiculoForm({ placa: '', modelo: '', cor: '' })
      setAddingVeiculo(false)
      router.refresh()
    })
  }

  const handleRemoveVeiculo = (veiculoId: string) => {
    startTransition(async () => {
      const result = await removerVeiculo(veiculoId)
      if (result.error) {
        setVeiculoError(result.error)
        return
      }
      setCliente((prev) =>
        prev ? { ...prev, veiculos: prev.veiculos.filter((v) => v.id !== veiculoId) } : prev
      )
      router.refresh()
    })
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    })
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        {loading || !cliente ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Carregando...
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{cliente.nome}</DialogTitle>
              <DialogDescription className="sr-only">
                Detalhes e edição do cliente
              </DialogDescription>
            </DialogHeader>

            {/* ── Perfil ── */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Perfil
                </h3>
                {!editingPerfil && (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-[var(--ink-2)] hover:bg-[var(--bg-2)]"
                    onClick={() => {
                      setPerfilForm({ nome: cliente.nome, whatsapp: cliente.whatsapp })
                      setEditingPerfil(true)
                      setPerfilError('')
                    }}
                  >
                    <Pencil size={12} /> Editar
                  </button>
                )}
              </div>

              {editingPerfil ? (
                <div className="flex flex-col gap-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[12px] font-medium text-[var(--ink-2)]">Nome</label>
                    <Input
                      value={perfilForm.nome}
                      onChange={(e) => setPerfilForm({ ...perfilForm, nome: e.target.value })}
                      autoFocus
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[12px] font-medium text-[var(--ink-2)]">WhatsApp</label>
                    <Input
                      className="font-mono"
                      value={perfilForm.whatsapp}
                      onChange={(e) => setPerfilForm({ ...perfilForm, whatsapp: e.target.value })}
                    />
                  </div>
                  {perfilError && <p className="text-xs text-[var(--rose)]">{perfilError}</p>}
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSavePerfil} disabled={isPending}>
                      <Check size={14} /> {isPending ? 'Salvando...' : 'Salvar'}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingPerfil(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-xl border border-[var(--line)] px-3 py-2.5">
                  <div>
                    <div className="text-sm font-semibold">{cliente.nome}</div>
                    <div className="font-mono text-xs text-muted-foreground">{cliente.whatsapp}</div>
                  </div>
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
              )}
            </div>

            {/* ── Veículos ── */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Veículos
                </h3>
                {!addingVeiculo && (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-[var(--ink-2)] hover:bg-[var(--bg-2)]"
                    onClick={() => {
                      setAddingVeiculo(true)
                      setNovoVeiculoForm({ placa: '', modelo: '', cor: '' })
                      setVeiculoError('')
                    }}
                  >
                    <Plus size={12} /> Adicionar
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {cliente.veiculos.map((v) =>
                  editingVeiculoId === v.id ? (
                    <div key={v.id} className="flex flex-col gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-3">
                      <div className="flex gap-2">
                        <div className="flex flex-1 flex-col gap-1">
                          <label className="text-[12px] font-medium text-[var(--ink-2)]">Placa</label>
                          <Input
                            className="font-mono uppercase"
                            value={veiculoForm.placa}
                            onChange={(e) => setVeiculoForm({ ...veiculoForm, placa: e.target.value.toUpperCase() })}
                            autoFocus
                          />
                        </div>
                        <div className="flex flex-1 flex-col gap-1">
                          <label className="text-[12px] font-medium text-[var(--ink-2)]">Cor</label>
                          <Input
                            value={veiculoForm.cor}
                            onChange={(e) => setVeiculoForm({ ...veiculoForm, cor: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[12px] font-medium text-[var(--ink-2)]">Modelo</label>
                        <Input
                          value={veiculoForm.modelo}
                          onChange={(e) => setVeiculoForm({ ...veiculoForm, modelo: e.target.value })}
                        />
                      </div>
                      {veiculoError && <p className="text-xs text-[var(--rose)]">{veiculoError}</p>}
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSaveVeiculo(v.id)} disabled={isPending}>
                          <Check size={14} /> Salvar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setEditingVeiculoId(null); setVeiculoError('') }}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={v.id}
                      className="flex items-center justify-between rounded-xl border border-[var(--line)] px-3 py-2.5"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <PlacaTag placa={v.placa} size="sm" />
                          <span className="text-sm font-semibold">{v.modelo}</span>
                        </div>
                        {v.cor && (
                          <div className="mt-1 text-xs text-muted-foreground">{v.cor}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-lg text-[var(--ink-2)] hover:bg-[var(--bg-2)]"
                          title="Editar veículo"
                          onClick={() => {
                            setVeiculoForm({ placa: v.placa, modelo: v.modelo, cor: v.cor })
                            setEditingVeiculoId(v.id)
                            setVeiculoError('')
                          }}
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-lg text-[var(--rose)] hover:bg-[color-mix(in_oklab,var(--rose)_10%,transparent)]"
                          title="Remover veículo"
                          onClick={() => handleRemoveVeiculo(v.id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  )
                )}

                {/* Formulário novo veículo */}
                {addingVeiculo && (
                  <div className="flex flex-col gap-2 rounded-xl border border-dashed border-[var(--line)] bg-[var(--surface-2)] p-3">
                    <div className="flex gap-2">
                      <div className="flex flex-1 flex-col gap-1">
                        <label className="text-[12px] font-medium text-[var(--ink-2)]">Placa</label>
                        <Input
                          className="font-mono uppercase"
                          value={novoVeiculoForm.placa}
                          onChange={(e) => setNovoVeiculoForm({ ...novoVeiculoForm, placa: e.target.value.toUpperCase() })}
                          autoFocus
                          placeholder="ABC1D23"
                        />
                      </div>
                      <div className="flex flex-1 flex-col gap-1">
                        <label className="text-[12px] font-medium text-[var(--ink-2)]">Cor</label>
                        <Input
                          value={novoVeiculoForm.cor}
                          onChange={(e) => setNovoVeiculoForm({ ...novoVeiculoForm, cor: e.target.value })}
                          placeholder="Prata"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[12px] font-medium text-[var(--ink-2)]">Modelo</label>
                      <Input
                        value={novoVeiculoForm.modelo}
                        onChange={(e) => setNovoVeiculoForm({ ...novoVeiculoForm, modelo: e.target.value })}
                        placeholder="Honda Civic"
                      />
                    </div>
                    {veiculoError && <p className="text-xs text-[var(--rose)]">{veiculoError}</p>}
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleAddVeiculo} disabled={isPending}>
                        <Car size={14} /> {isPending ? 'Salvando...' : 'Adicionar'}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => { setAddingVeiculo(false); setVeiculoError('') }}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}

                {cliente.veiculos.length === 0 && !addingVeiculo && (
                  <div className="py-3 text-center text-[13px] text-muted-foreground">
                    Nenhum veículo cadastrado.
                  </div>
                )}
              </div>
            </div>

            {/* ── Extrato de lavagens ── */}
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Extrato de lavagens
              </h3>
              {cliente.lavagens.length === 0 ? (
                <div className="py-3 text-center text-[13px] text-muted-foreground">
                  Sem histórico ainda.
                </div>
              ) : (
                <div className="flex flex-col gap-0">
                  {cliente.lavagens.map((l, idx) => {
                    const isLast = idx === cliente.lavagens.length - 1
                    const hadOcorrencia = l.ocorrencia_descricao && l.ocorrencia_descricao.trim() !== ''
                    return (
                      <div key={l.id} className="flex gap-3">
                        {/* Timeline dot + line */}
                        <div className="flex flex-col items-center">
                          <div
                            className="mt-1.5 h-2.5 w-2.5 flex-none rounded-full border-2"
                            style={{
                              borderColor: hadOcorrencia ? 'var(--rose)' : 'var(--brand)',
                              background: hadOcorrencia ? 'var(--rose)' : 'var(--brand)',
                            }}
                          />
                          {!isLast && (
                            <div className="w-px flex-1 bg-[var(--line)]" />
                          )}
                        </div>
                        {/* Content */}
                        <div className={`flex-1 pb-4 ${isLast ? '' : ''}`}>
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-[13px] font-semibold">{l.servico?.nome}</div>
                            <div className="text-sm font-bold">{moneyBR(l.valor)}</div>
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatDate(l.entrada_em)}</span>
                            <span>&middot;</span>
                            <span>{l.veiculo?.placa}</span>
                            <span>&middot;</span>
                            <StatusBadge status={l.status_atual as LavagemStatus} size="sm" />
                          </div>
                          {hadOcorrencia && (
                            <div className="mt-1 rounded-lg bg-[color-mix(in_oklab,var(--rose)_8%,transparent)] px-2 py-1 text-xs text-[var(--rose)]">
                              ⚠ {l.ocorrencia_descricao}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
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
