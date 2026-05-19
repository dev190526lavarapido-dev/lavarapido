import Link from "next/link";
import {
  MessageCircle,
  Phone,
  MapPin,
  Clock,
  AtSign,
  Info,
  Key,
  Droplets,
} from "lucide-react";
import { getConfigLojaPublica } from "@/server/queries/config";
import { getServicosPublicos } from "@/server/queries/publicas";
import { waLink, onlyDigits } from "@/lib/whatsapp";
import { moneyBR } from "@/components/money";
import type { ConfigLoja } from "@/lib/types";

interface Props {
  searchParams: Promise<{ lavagem?: string }>;
}

export default async function VitrinePage({ searchParams }: Props) {
  const params = await searchParams;
  const encerrada = params.lavagem === "encerrada";

  const [config, servicos] = await Promise.all([
    getConfigLojaPublica(),
    getServicosPublicos(),
  ]);

  if (!config) {
    return (
      <div className="pub-shell items-center justify-center">
        <Droplets size={48} className="text-[var(--muted-color)] mb-4" />
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Nenhuma loja configurada
        </h1>
        <p className="text-[var(--muted-color)] mt-2 text-center max-w-sm">
          A vitrine ainda nao esta disponivel. Se voce e o dono, acesse o painel
          para configurar.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold"
        >
          <Key size={14} /> Acessar painel
        </Link>
      </div>
    );
  }

  const whatsHref = waLink(
    config.whatsapp,
    config.mensagem_whatsapp_padrao || ""
  );
  const telHref = `tel:${onlyDigits(config.telefone)}`;

  return (
    <div className="pub-shell">
      {/* ── Header ── */}
      <header className="pub-header">
        <div className="flex items-center gap-3">
          <LogoOrInitial config={config} />
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 18,
                letterSpacing: "-0.02em",
              }}
            >
              {config.nome_loja}
            </div>
            <div className="text-xs text-[var(--muted-color)]">
              {config.horario_funcionamento}
            </div>
          </div>
        </div>
        <Link
          href="/login"
          className="hidden md:inline-flex items-center gap-1.5 rounded-[10px] px-3 py-1.5 text-sm font-medium text-[var(--ink-2)] hover:bg-[var(--bg-2)]"
        >
          <Key size={14} /> Sou da equipe
        </Link>
      </header>

      {/* ── Banner lavagem encerrada ── */}
      {encerrada && (
        <div className="pub-banner-encerrada">
          <Info size={14} /> Essa lavagem ja foi encerrada. Olha embaixo os
          servicos que a gente tem disponivel ;)
        </div>
      )}

      {/* ── Hero ── */}
      <section className="pub-hero">
        <div className="nome-loja">{config.nome_loja}</div>
        <div className="desc">{config.descricao}</div>

        <div className="pub-cta-row">
          <a
            href={whatsHref}
            target="_blank"
            rel="noreferrer"
            className="pub-cta whats"
          >
            <MessageCircle size={22} /> WhatsApp
          </a>
          <a href={telHref} className="pub-cta">
            <Phone size={22} /> Ligar
          </a>
          {config.maps_url && (
            <a
              href={config.maps_url}
              target="_blank"
              rel="noreferrer"
              className="pub-cta"
            >
              <MapPin size={22} /> Como chegar
            </a>
          )}
        </div>
      </section>

      {/* ── Servicos ── */}
      {servicos.length > 0 && (
        <section className="pub-section">
          <h2>Nossos servicos</h2>
          <div className="pub-svc-grid">
            {servicos.map((s) => (
              <div className="pub-svc" key={s.id}>
                <div>
                  <div className="nome">{s.nome}</div>
                  <div className="desc">{s.descricao}</div>
                  {s.tempo_estimado_minutos && (
                    <div className="meta mt-2">
                      <Clock size={12} /> ~{s.tempo_estimado_minutos} min
                    </div>
                  )}
                </div>
                <div className="preco">{moneyBR(s.valor)}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Info cards ── */}
      <section className="pub-section">
        <h2>A gente fica aqui</h2>
        <div className="pub-info">
          <div className="info-card">
            <div className="icon-wrap">
              <MapPin size={20} />
            </div>
            <div>
              <div className="label">Endereco</div>
              <div className="value">{config.endereco_texto}</div>
            </div>
          </div>

          <div className="info-card">
            <div className="icon-wrap">
              <Clock size={20} />
            </div>
            <div>
              <div className="label">Horario</div>
              <div className="value">{config.horario_funcionamento}</div>
            </div>
          </div>

          <div className="info-card">
            <div className="icon-wrap">
              <Phone size={20} />
            </div>
            <div>
              <div className="label">Telefone</div>
              <div className="value font-mono">{config.telefone}</div>
            </div>
          </div>

          {config.instagram_url && (
            <div className="info-card">
              <div className="icon-wrap">
                <AtSign size={20} />
              </div>
              <div>
                <div className="label">Instagram</div>
                <div className="value">{config.instagram_url}</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="pub-foot">
        Feito com 💧 e muita espuma · {config.nome_loja}
      </footer>
    </div>
  );
}

/* eslint-disable @next/next/no-img-element */
function LogoOrInitial({ config }: { config: ConfigLoja }) {
  if (config.logo_url) {
    return (
      <img
        src={config.logo_url}
        alt={config.nome_loja}
        width={56}
        height={56}
        className="rounded-[14px] object-cover"
        style={{ width: 56, height: 56 }}
      />
    );
  }
  return (
    <div
      className="grid place-items-center rounded-[14px] bg-[var(--brand)] text-[var(--brand-ink)]"
      style={{
        width: 56,
        height: 56,
        fontFamily: "var(--font-display)",
        fontWeight: 800,
        fontSize: 22,
      }}
    >
      {config.nome_loja.charAt(0)}
    </div>
  );
}
