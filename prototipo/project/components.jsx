/* ============================================================
   Lava Rápido Marquinhos — primitives compartilhados
   Exporta tudo para window no final.
   ============================================================ */

const { useState, useEffect, useRef, useMemo, useCallback } = React;

/* =================== ÍCONES (SVG inline) =================== */
const Icon = ({ name, size = 18, ...rest }) => {
  const s = size;
  const stroke = "currentColor";
  const common = { width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke, strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", className: "icon", ...rest };
  switch (name) {
    case "dashboard": return (<svg {...common}><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>);
    case "kanban": return (<svg {...common}><rect x="3" y="3" width="5" height="18" rx="1.5"/><rect x="10" y="3" width="5" height="12" rx="1.5"/><rect x="17" y="3" width="4" height="8" rx="1.5"/></svg>);
    case "plus":   return (<svg {...common}><path d="M12 5v14M5 12h14"/></svg>);
    case "users":  return (<svg {...common}><circle cx="9" cy="8" r="3.5"/><path d="M2 20a7 7 0 0 1 14 0"/><circle cx="17" cy="9" r="2.8"/><path d="M22 19a5 5 0 0 0-6-4.6"/></svg>);
    case "tag":    return (<svg {...common}><path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9-9-9Z"/><circle cx="8.5" cy="8.5" r="1.3" fill="currentColor"/></svg>);
    case "gear":   return (<svg {...common}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3.1V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1A1.7 1.7 0 0 0 19.4 9 1.7 1.7 0 0 0 21 10h.1a2 2 0 1 1 0 4H21a1.7 1.7 0 0 0-1.6 1Z"/></svg>);
    case "car":    return (<svg {...common}><path d="M3 13l1.5-5A2 2 0 0 1 6.4 6.5h11.2A2 2 0 0 1 19.5 8L21 13"/><path d="M3 13h18v5H3z"/><circle cx="7" cy="18" r="2" fill="currentColor" stroke="none"/><circle cx="17" cy="18" r="2" fill="currentColor" stroke="none"/></svg>);
    case "droplet":return (<svg {...common}><path d="M12 3s6 7 6 11a6 6 0 1 1-12 0c0-4 6-11 6-11Z"/></svg>);
    case "sparkle":return (<svg {...common}><path d="M12 3v6M12 15v6M3 12h6M15 12h6M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3"/></svg>);
    case "soap":   return (<svg {...common}><circle cx="9" cy="9" r="3.5"/><circle cx="16" cy="14" r="2.2"/><circle cx="9" cy="17" r="1.6"/></svg>);
    case "search": return (<svg {...common}><circle cx="11" cy="11" r="6.5"/><path d="m20 20-3.5-3.5"/></svg>);
    case "filter": return (<svg {...common}><path d="M3 5h18M6 12h12M10 19h4"/></svg>);
    case "phone":  return (<svg {...common}><path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z"/></svg>);
    case "whats":  return (<svg viewBox="0 0 24 24" width={s} height={s} fill="currentColor" className="icon" {...rest}><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.92.5 3.78 1.46 5.42L2 22l4.79-1.25a9.92 9.92 0 0 0 5.24 1.48h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.85 9.85 0 0 0 12.04 2Zm0 18.13h-.01a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-2.83.74.76-2.76-.2-.31a8.18 8.18 0 0 1-1.26-4.37c0-4.55 3.7-8.25 8.25-8.25 2.2 0 4.28.86 5.83 2.42a8.2 8.2 0 0 1 2.42 5.83c0 4.55-3.7 8.25-8.25 8.25Zm4.52-6.18c-.25-.12-1.47-.72-1.7-.8-.23-.08-.39-.12-.56.12-.16.25-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.71-.14-.25-.02-.38.1-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.23.25-.86.84-.86 2.05 0 1.21.88 2.38 1 2.54.12.16 1.74 2.66 4.22 3.73.59.25 1.05.4 1.41.52.59.19 1.13.16 1.55.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.1-.23-.16-.48-.28Z"/></svg>);
    case "pin":    return (<svg {...common}><path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/></svg>);
    case "clock":  return (<svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>);
    case "check":  return (<svg {...common}><path d="m5 12 5 5 9-11"/></svg>);
    case "x":      return (<svg {...common}><path d="m6 6 12 12M18 6 6 18"/></svg>);
    case "alert":  return (<svg {...common}><path d="M10.3 3.86a2 2 0 0 1 3.4 0l8.21 14a2 2 0 0 1-1.7 3.04H3.79A2 2 0 0 1 2.09 17.86l8.21-14Z"/><path d="M12 9v4M12 17h.01"/></svg>);
    case "play":   return (<svg viewBox="0 0 24 24" width={s} height={s} fill="currentColor" className="icon" {...rest}><path d="M7 5v14l12-7L7 5Z"/></svg>);
    case "back":   return (<svg {...common}><path d="m12 19-7-7 7-7M5 12h14"/></svg>);
    case "fwd":    return (<svg {...common}><path d="m12 5 7 7-7 7M5 12h14"/></svg>);
    case "more":   return (<svg {...common}><circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="19" cy="12" r="1.5" fill="currentColor"/></svg>);
    case "list":   return (<svg {...common}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>);
    case "money":  return (<svg {...common}><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9v0M6 15v0M18 9v0M18 15v0"/></svg>);
    case "logout": return (<svg {...common}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/></svg>);
    case "sun":    return (<svg {...common}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>);
    case "edit":   return (<svg {...common}><path d="m4 20 4-1 11-11-3-3L5 16l-1 4Z"/><path d="m14 5 3 3"/></svg>);
    case "trash":  return (<svg {...common}><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>);
    case "external":return (<svg {...common}><path d="M15 3h6v6M21 3l-9 9M14 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>);
    case "copy":   return (<svg {...common}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>);
    case "store":  return (<svg {...common}><path d="M3 9V7l2-3h14l2 3v2a2 2 0 0 1-4 0 2 2 0 0 1-4 0 2 2 0 0 1-4 0 2 2 0 0 1-4 0 2 2 0 0 1-4 0Z"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></svg>);
    case "share":  return (<svg {...common}><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="m8 11 8-4M8 13l8 4"/></svg>);
    case "instagram": return (<svg {...common}><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor"/></svg>);
    case "key":    return (<svg {...common}><circle cx="8" cy="15" r="4"/><path d="m10.8 12.2 9.2-9.2-2 2 2 2-4 4-2-2"/></svg>);
    case "info":   return (<svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/></svg>);
    default:       return (<svg {...common}><circle cx="12" cy="12" r="9"/></svg>);
  }
};

/* =================== STATUS ===================== */
const STATUS_META = {
  aguardando_lavagem: { label: "Aguardando",    klass: "aguardando", icon: "clock",   color: "var(--st-aguardando)" },
  lavando:            { label: "Lavando",       klass: "lavando",    icon: "droplet", color: "var(--st-lavando)" },
  lavagem_concluida:  { label: "Concluída",     klass: "concluida",  icon: "check",   color: "var(--st-concluida)" },
  ocorrencia:         { label: "Ocorrência",    klass: "ocorrencia", icon: "alert",   color: "var(--st-ocorrencia)" },
  retirado:           { label: "Retirado",      klass: "retirado",   icon: "check",   color: "var(--st-retirado)" }
};

const StatusBadge = ({ status, size }) => {
  const m = STATUS_META[status];
  if (!m) return null;
  return (
    <span className={`badge ${m.klass}`} style={size === 'sm' ? { fontSize: 11, padding: '2px 8px' } : null}>
      <span className="dot" />
      {m.label}
    </span>
  );
};

/* =================== BUTTON ===================== */
const Button = ({ kind = "default", size, block, icon, iconRight, children, className = "", ...rest }) => {
  const classes = ["btn"];
  if (kind === "primary") classes.push("primary");
  if (kind === "ghost")   classes.push("ghost");
  if (kind === "danger")  classes.push("danger");
  if (kind === "success") classes.push("success");
  if (kind === "whats")   classes.push("btn-whats");
  if (size) classes.push(size);
  if (block) classes.push("block");
  if (!children && icon) classes.push("icon-only");
  classes.push(className);
  return (
    <button className={classes.join(" ")} {...rest}>
      {icon && (typeof icon === 'string' ? <Icon name={icon} size={16} /> : icon)}
      {children}
      {iconRight && (typeof iconRight === 'string' ? <Icon name={iconRight} size={16} /> : iconRight)}
    </button>
  );
};

/* =================== MODAL / SHEET ===================== */
const Modal = ({ title, onClose, children, footer }) => {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);
  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className="modal-card" role="dialog" aria-modal="true">
        <div className="modal-grab" />
        <div className="modal-head">
          <div className="modal-title">{title}</div>
          {onClose && <Button kind="ghost" icon="x" size="sm" onClick={onClose} aria-label="Fechar" />}
        </div>
        <div>{children}</div>
        {footer && <div className="mt-4 row" style={{ gap: 8 }}>{footer}</div>}
      </div>
    </div>
  );
};

/* =================== TIMELINE ===================== */
const formatHM = (iso) => {
  const d = new Date(iso);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const Timeline = ({ eventos, animateLast }) => {
  return (
    <div className="timeline">
      {eventos.map((ev, i) => {
        const meta = STATUS_META[ev.status] || { label: ev.status, klass: 'entrada', icon: 'car' };
        const klass = ev.status === 'entrada' ? 'entrada' : meta.klass;
        const isCurrent = i === eventos.length - 1 && ev.status !== 'retirado';
        const isLast = i === eventos.length - 1;
        return (
          <div className={`tl-item ${klass} ${isCurrent ? 'is-current' : ''} ${(animateLast && isLast) ? 'fadein' : ''}`} key={i}>
            <div className="tl-marker"><Icon name={ev.status === 'entrada' ? 'car' : meta.icon} size={14} /></div>
            <div className="tl-body">
              <div className="tl-title">
                {ev.status === 'entrada' ? 'Carro deu entrada' :
                 ev.status === 'aguardando_lavagem' ? 'Aguardando lavagem' :
                 ev.status === 'lavando' ? 'Lavagem em andamento' :
                 ev.status === 'lavagem_concluida' ? 'Lavagem concluída' :
                 ev.status === 'ocorrencia' ? 'Ocorrência' :
                 ev.status === 'retirado' ? 'Carro retirado' : ev.status}
              </div>
              {ev.descricao && ev.descricao !== ev.status && <div className="tl-desc">{ev.descricao}</div>}
              <div className="tl-time mt-2">{formatHM(ev.t)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* =================== HELPERS GERAIS ===================== */
const moneyBR = (v) => "R$ " + Number(v).toFixed(2).replace('.', ',');
const initials = (name) => name.split(' ').filter(Boolean).slice(0,2).map(w => w[0]).join('').toUpperCase();
const placaFmt = (p) => p.toUpperCase();

const onlyDigits = (s) => (s || '').replace(/\D/g, '');
const waLink = (whatsapp, msg) => `https://wa.me/${onlyDigits(whatsapp)}?text=${encodeURIComponent(msg)}`;

const buildPubUrl = (token) => `${location.origin}${location.pathname}#/a/${token}`;

/* WhatsApp message builder
   Header (saudação + nome) e footer (link + loja) são FIXOS.
   O miolo (body) é editável pelo gestor em Configurações por etapa. */
const DEFAULT_TEMPLATES = {
  entrada:    "Seu carro ({{placa}}) deu entrada aqui no lava rápido. Já vou cuidar do {{servico}} pra você 🚗💧",
  lavando:    "A lavagem do seu {{placa}} começou agora ✨\nServiço: {{servico}}.",
  concluida:  "O {{placa}} já tá limpinho e te esperando aqui no lava 🚗💨\nVem buscar quando puder!",
  retirado:   "Valeu por confiar na gente! Volta sempre — a gente fica feliz em ver você de novo 🙏",
  ocorrencia: "Temos um aviso sobre o seu {{placa}}:\n{{descricao}}",
  aguardando: "Voltamos o seu {{placa}} pra fila por um instante — já já a gente retoma a lavagem 👍"
};

const fillTemplate = (tmpl, vars) =>
  (tmpl || '')
    .replace(/\{\{nome_cliente\}\}/g, vars.nome || '')
    .replace(/\{\{placa\}\}/g, vars.placa || '')
    .replace(/\{\{servico\}\}/g, vars.servico || '')
    .replace(/\{\{nome_loja\}\}/g, vars.lojaNome || '')
    .replace(/\{\{link_acompanhamento\}\}/g, vars.link || '')
    .replace(/\{\{descricao\}\}/g, vars.descricao || '')
    .replace(/\{\{descricao_ocorrencia\}\}/g, vars.descricao || '');

// Header (fixo) — sempre o mesmo
const waHeader = (vars) => `Olá, ${vars.nome}! 👋`;

// Footer (fixo) — link + assinatura
const waFooter = (vars, withLink = true) => {
  const parts = [];
  if (withLink && vars.link) parts.push(`Acompanhe por aqui:\n${vars.link}`);
  if (vars.lojaNome) parts.push(`— Equipe ${vars.lojaNome}`);
  return parts.join('\n\n');
};

const buildWaMessage = (tipo, ctx) => {
  const { cliente, veiculo, servico, loja, link, descricao } = ctx;
  const vars = {
    nome: (cliente?.nome || '').split(' ')[0],
    placa: veiculo?.placa || '',
    servico: servico?.nome || '',
    lojaNome: loja?.nome_loja || '',
    link, descricao
  };

  if (tipo === 'manual') {
    return `${waHeader(vars)}\n\nQuerendo te dar um retorno sobre o seu ${vars.placa}.\n\n${waFooter(vars, true)}`;
  }

  const templates = loja?.mensagens_etapas || {};
  const tmpl = templates[tipo] ?? DEFAULT_TEMPLATES[tipo] ?? '';
  const body = fillTemplate(tmpl, vars);

  // retirado normalmente não precisa do link (lavagem já encerrada)
  const includeLink = tipo !== 'retirado';
  return `${waHeader(vars)}\n\n${body}\n\n${waFooter(vars, includeLink)}`;
};

const tituloPorTipo = (tipo) => ({
  entrada:    "Avisar entrada",
  lavando:    "Avisar início da lavagem",
  concluida:  "Avisar conclusão",
  ocorrencia: "Avisar ocorrência",
  retirado:   "Confirmar retirada",
  aguardando: "Avisar volta pra fila",
  manual:     "Mandar mensagem pro cliente"
})[tipo] || "Mandar mensagem";

// Mapeia status alvo → tipo de mensagem do WhatsApp
const tipoMsgParaStatus = (status) => ({
  aguardando_lavagem: 'aguardando',
  lavando:            'lavando',
  lavagem_concluida:  'concluida',
  ocorrencia:         'ocorrencia',
  retirado:           'retirado'
})[status] || 'manual';

/* Compose route hash */
const hashFor = (route, params = {}) => {
  if (route === 'publica-loja') return '#/';
  if (route === 'publica-token') return `#/a/${params.token || ''}`;
  return `#/gestor/${route}`;
};

/* =================== EXPORTS ===================== */
Object.assign(window, {
  Icon, StatusBadge, Button, Modal, Timeline,
  STATUS_META, formatHM, moneyBR, initials, placaFmt,
  onlyDigits, waLink, buildPubUrl, buildWaMessage, tituloPorTipo, tipoMsgParaStatus, hashFor,
  DEFAULT_TEMPLATES, fillTemplate, waHeader, waFooter
});
