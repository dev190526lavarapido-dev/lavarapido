"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  Plus,
  Clock,
  Check,
} from "lucide-react";

import { PlacaTag } from "@/components/placa-tag";
import { moneyBR } from "@/components/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { criarLavagem } from "@/server/actions/lavagens";
import { criarClienteComVeiculo } from "@/server/actions/clientes";
import type { ClienteComVeiculos, ServicoLavagem, Veiculo } from "@/lib/types";

// --- Avatar colors (cycle through 5) ---
const AVATAR_COLORS = [
  "bg-[color-mix(in_oklab,var(--yellow)_35%,var(--bg))]",
  "bg-[color-mix(in_oklab,var(--brand)_30%,var(--bg))]",
  "bg-[color-mix(in_oklab,var(--mint)_30%,var(--bg))]",
  "bg-[color-mix(in_oklab,var(--sky)_30%,var(--bg))]",
  "bg-[color-mix(in_oklab,var(--rose)_28%,var(--bg))]",
] as const;

function initials(nome: string): string {
  return nome
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function avatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

// --- Wizard Step indicator ---
function WizardStep({
  n,
  label,
  current,
}: {
  n: number;
  label: string;
  current: number;
}) {
  const isActive = current === n;
  const isDone = current > n;
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-[13px] font-medium text-[var(--muted)]",
        isActive && "text-[var(--ink)]",
        isDone && "text-[var(--ink-2)]"
      )}
    >
      <span
        className={cn(
          "grid h-6 w-6 place-items-center rounded-full text-xs font-semibold",
          "bg-[var(--bg-2)] text-[var(--muted)]",
          (isActive || isDone) &&
            "bg-[var(--brand)] text-[var(--brand-ink)]"
        )}
      >
        {isDone ? "\u2713" : n}
      </span>
      <span>{label}</span>
    </div>
  );
}

// --- Summary row ---
function RowInfo({
  label,
  value,
  mono,
  bold,
}: {
  label: string;
  value: string;
  mono?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-dashed border-[var(--line)] pb-2">
      <span className="text-[13px] text-[var(--muted)]">{label}</span>
      <span
        className={cn(
          "text-sm",
          bold && "text-lg font-bold",
          !bold && "font-medium",
          mono && "font-mono"
        )}
      >
        {value}
      </span>
    </div>
  );
}

// --- Main Wizard ---
interface NovaLavagemWizardProps {
  clientes: ClienteComVeiculos[];
  servicos: ServicoLavagem[];
}

export function NovaLavagemWizard({
  clientes,
  servicos,
}: NovaLavagemWizardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Wizard state
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedCliente, setSelectedCliente] =
    useState<ClienteComVeiculos | null>(null);
  const [selectedVeiculo, setSelectedVeiculo] = useState<Veiculo | null>(null);
  const [selectedServico, setSelectedServico] =
    useState<ServicoLavagem | null>(null);
  const [obs, setObs] = useState("");
  const [criandoCliente, setCriandoCliente] = useState(false);

  // New client form
  const [novoCli, setNovoCli] = useState({ nome: "", whatsapp: "" });
  const [novoVei, setNovoVei] = useState({ placa: "", modelo: "", cor: "" });
  const [formError, setFormError] = useState("");

  // Filter clients
  const clientesFiltrados = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clientes.slice(0, 10);
    return clientes.filter(
      (c) =>
        c.nome.toLowerCase().includes(q) ||
        c.whatsapp.toLowerCase().includes(q) ||
        c.veiculos.some((v) => v.placa.toLowerCase().includes(q))
    );
  }, [search, clientes]);

  // Select client + vehicle, go to step 2
  function selectClienteVeiculo(
    cliente: ClienteComVeiculos,
    veiculo: Veiculo
  ) {
    setSelectedCliente(cliente);
    setSelectedVeiculo(veiculo);
    setStep(2);
  }

  // Create new client inline
  function handleCriarCliente() {
    if (!novoCli.nome.trim() || !novoCli.whatsapp.trim() || !novoVei.placa.trim()) {
      setFormError("Preencha nome, WhatsApp e placa.");
      return;
    }
    setFormError("");
    startTransition(async () => {
      const result = await criarClienteComVeiculo(
        { nome: novoCli.nome.trim(), whatsapp: novoCli.whatsapp.trim() },
        {
          placa: novoVei.placa.toUpperCase().trim(),
          modelo: novoVei.modelo.trim(),
          cor: novoVei.cor.trim(),
        }
      );
      if (result.error) {
        setFormError(result.error);
        return;
      }
      if (result.data) {
        const { cliente, veiculo } = result.data;
        const cliComVeiculos: ClienteComVeiculos = {
          ...cliente,
          veiculos: [veiculo],
          total_lavagens: 0,
        };
        setSelectedCliente(cliComVeiculos);
        setSelectedVeiculo(veiculo);
        setCriandoCliente(false);
        setStep(2);
      }
    });
  }

  // Confirm
  function handleConfirmar() {
    if (!selectedCliente || !selectedVeiculo || !selectedServico) return;
    startTransition(async () => {
      const result = await criarLavagem({
        cliente_id: selectedCliente.id,
        veiculo_id: selectedVeiculo.id,
        servico_id: selectedServico.id,
        valor: selectedServico.valor,
        observacao: obs,
      });
      if (result.error) {
        setFormError(result.error);
        return;
      }
      router.push("/gestor/lavagens?whatsapp=new");
    });
  }

  return (
    <div>
      {/* Page head */}
      <div className="mb-5 flex flex-col gap-3 max-md:items-stretch md:flex-row md:items-end md:justify-between">
        <div>
          <Link
            href="/gestor/lavagens"
            className="inline-flex h-[34px] items-center gap-1.5 rounded-[10px] px-3 text-[13px] font-semibold text-[var(--ink-2)] hover:bg-[var(--bg-2)] hover:text-[var(--ink)]"
          >
            <ArrowLeft size={14} /> Voltar
          </Link>
          <h1 className="mt-2 font-heading text-[30px] font-bold leading-tight tracking-[-0.025em]">
            Nova lavagem
          </h1>
        </div>
      </div>

      {/* Wizard steps bar */}
      <div className="mb-5 flex items-center gap-2">
        <WizardStep n={1} label="Cliente & veículo" current={step} />
        <span className="text-[var(--line)]">&mdash;</span>
        <WizardStep n={2} label="Serviço" current={step} />
        <span className="text-[var(--line)]">&mdash;</span>
        <WizardStep n={3} label="Confirmar" current={step} />
      </div>

      {/* ======= STEP 1 — Cliente & Veiculo ======= */}
      {step === 1 && (
        <div className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)] p-[18px]">
          {!criandoCliente && (
            <>
              {/* Search pill */}
              <div className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2">
                <Search size={16} className="text-[var(--muted)]" />
                <input
                  autoFocus
                  className="flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-[var(--muted)]"
                  placeholder="Buscar por nome, WhatsApp ou placa..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Client list */}
              <div className="flex flex-col gap-2">
                {clientesFiltrados.map((c, idx) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 rounded-[14px] border border-[var(--line)] bg-[var(--surface)] p-3 hover:border-[var(--brand)]"
                  >
                    {/* Avatar */}
                    <div
                      className={cn(
                        "grid h-10 w-10 flex-none place-items-center rounded-xl font-heading text-base font-bold",
                        avatarColor(idx)
                      )}
                    >
                      {initials(c.nome)}
                    </div>
                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold">{c.nome}</div>
                      <div className="text-xs font-mono text-[var(--muted)]">
                        {c.whatsapp}
                      </div>
                      {/* Vehicles as buttons */}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {c.veiculos.map((v) => (
                          <button
                            key={v.id}
                            type="button"
                            data-testid="veiculo-btn"
                            className="inline-flex h-[30px] items-center gap-1.5 rounded-[10px] border border-[var(--line)] bg-[var(--surface)] px-2.5 text-xs font-semibold hover:border-[var(--brand)] hover:bg-[var(--bg-2)]"
                            onClick={() => selectClienteVeiculo(c, v)}
                          >
                            <PlacaTag placa={v.placa} size="sm" />
                            <span className="text-xs">{v.modelo}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {clientesFiltrados.length === 0 && (
                  <div className="py-5 text-center text-sm text-[var(--muted)]">
                    Nenhum cliente encontrado. Cadastra agora ali em baixo
                    &#x1F447;
                  </div>
                )}
              </div>

              {/* New client button */}
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => setCriandoCliente(true)}
              >
                <Plus size={16} /> Cadastrar cliente novo
              </Button>
            </>
          )}

          {/* Inline new client form */}
          {criandoCliente && (
            <div className="flex flex-col gap-3">
              <h3 className="font-heading text-lg font-bold">Novo cliente</h3>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[var(--ink-2)]">
                  Nome
                </label>
                <Input
                  value={novoCli.nome}
                  onChange={(e) =>
                    setNovoCli({ ...novoCli, nome: e.target.value })
                  }
                  placeholder="Ex: Marcelo Andrade"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[var(--ink-2)]">
                  WhatsApp
                </label>
                <Input
                  value={novoCli.whatsapp}
                  onChange={(e) =>
                    setNovoCli({ ...novoCli, whatsapp: e.target.value })
                  }
                  placeholder="+55 11 9..."
                />
              </div>

              <h3 className="mt-4 font-heading text-lg font-bold">Veiculo</h3>
              <div className="flex gap-2.5">
                <div className="flex flex-1 flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-[var(--ink-2)]">
                    Placa
                  </label>
                  <Input
                    className="font-mono uppercase"
                    value={novoVei.placa}
                    onChange={(e) =>
                      setNovoVei({
                        ...novoVei,
                        placa: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="ABC1D23"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-[var(--ink-2)]">
                    Cor
                  </label>
                  <Input
                    value={novoVei.cor}
                    onChange={(e) =>
                      setNovoVei({ ...novoVei, cor: e.target.value })
                    }
                    placeholder="Prata"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[var(--ink-2)]">
                  Modelo
                </label>
                <Input
                  value={novoVei.modelo}
                  onChange={(e) =>
                    setNovoVei({ ...novoVei, modelo: e.target.value })
                  }
                  placeholder="Honda Civic"
                />
              </div>

              {formError && (
                <div className="text-sm text-[var(--rose)]">{formError}</div>
              )}

              <div className="mt-2 flex gap-2">
                <Button
                  onClick={handleCriarCliente}
                  disabled={isPending}
                >
                  {isPending ? "Salvando..." : "Salvar e seguir"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setCriandoCliente(false);
                    setFormError("");
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======= STEP 2 — Servico ======= */}
      {step === 2 && (
        <div className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)] p-[18px]">
          {/* Selected client header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-[var(--muted)]">Cliente</div>
              <div className="font-semibold">{selectedCliente?.nome}</div>
              <div className="mt-2 flex items-center gap-2">
                {selectedVeiculo && (
                  <PlacaTag placa={selectedVeiculo.placa} />
                )}
                <span className="text-[13px] text-[var(--muted)]">
                  {selectedVeiculo?.modelo} &middot; {selectedVeiculo?.cor}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStep(1);
                setSelectedServico(null);
              }}
            >
              Trocar
            </Button>
          </div>

          {/* Service list */}
          <div>
            <h3 className="mb-2.5 text-base font-semibold">
              Escolha o serviço
            </h3>
            <div className="flex flex-col gap-2">
              {[...servicos].sort((a, b) => (a.ordem_exibicao ?? 0) - (b.ordem_exibicao ?? 0)).map((s) => {
                const isSelected = selectedServico?.id === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    data-testid="servico-btn"
                    className={cn(
                      "flex items-center justify-between gap-2.5 rounded-2xl border bg-[var(--surface)] p-3.5 text-left transition-all",
                      isSelected
                        ? "border-[var(--brand)] shadow-[0_0_0_3px_color-mix(in_oklab,var(--brand)_20%,transparent)]"
                        : "border-[var(--line)] hover:border-[var(--brand)]"
                    )}
                    onClick={() => setSelectedServico(s)}
                  >
                    <div>
                      <div className="text-[15px] font-semibold">{s.nome}</div>
                      {s.descricao && (
                        <div className="mt-0.5 text-[13px] text-[var(--muted)]">
                          {s.descricao}
                        </div>
                      )}
                      {s.tempo_estimado_minutos && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-[var(--muted)]">
                          <Clock size={12} /> ~{s.tempo_estimado_minutos} min
                        </div>
                      )}
                    </div>
                    <div className="whitespace-nowrap font-heading text-[22px] font-bold tracking-tight">
                      {moneyBR(s.valor)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nav buttons */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setStep(1)}>
              Voltar
            </Button>
            <div className="flex-1" />
            <Button
              disabled={!selectedServico}
              onClick={() => setStep(3)}
              className="gap-2"
            >
              Continuar
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* ======= STEP 3 — Confirmar ======= */}
      {step === 3 && selectedCliente && selectedVeiculo && selectedServico && (
        <div className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)] p-[18px]">
          <h3 className="font-heading text-lg font-bold">
            Tudo certo, Marquinhos?
          </h3>

          <div className="flex flex-col gap-3">
            <RowInfo label="Cliente" value={selectedCliente.nome} />
            <RowInfo label="WhatsApp" value={selectedCliente.whatsapp} mono />
            <RowInfo
              label="Veiculo"
              value={`${selectedVeiculo.placa} \u00B7 ${selectedVeiculo.modelo} \u00B7 ${selectedVeiculo.cor}`}
            />
            <RowInfo label="Servico" value={selectedServico.nome} />
            <RowInfo
              label="Valor"
              value={moneyBR(selectedServico.valor)}
              bold
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[var(--ink-2)]">
              Observação (opcional)
            </label>
            <Textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder="Ex: cuidado com o tapete do porta-malas..."
            />
          </div>

          <div className="text-xs text-[var(--muted)]">
            Ao confirmar, a gente cria a lavagem, gera o link de
            acompanhamento e já abre o WhatsApp com a mensagem de entrada
            pronta pra você revisar e enviar.
          </div>

          {formError && (
            <div className="text-sm text-[var(--rose)]">{formError}</div>
          )}

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setStep(2)}>
              Voltar
            </Button>
            <div className="flex-1" />
            <Button
              size="lg"
              disabled={isPending}
              onClick={handleConfirmar}
              className="gap-2"
            >
              <Check size={16} />
              {isPending ? "Criando..." : "Confirmar entrada"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
