/* ============================================================
   Configurações da loja
   ============================================================ */
const ConfiguracoesScreen = () => {
  const { state, dispatch } = window.useApp();
  const [v, setV] = React.useState(state.loja);
  const [saved, setSaved] = React.useState(false);

  const save = () => {
    // tema e cor_primaria são aplicados ao vivo (não bagunça eles aqui)
    const { tema, cor_primaria, ...patch } = v;
    dispatch({ type: 'UPDATE_LOJA', patch });
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">Configurações da loja</div>
          <div className="page-sub">Tudo o que aparece pro cliente na vitrine pública e nos avisos.</div>
        </div>
        <div className="actions">
          <Button kind="primary" icon="check" onClick={save}>{saved ? 'Salvo!' : 'Salvar alterações'}</Button>
        </div>
      </div>

      <div className="stack gap-4 mt-2" style={{ maxWidth: 720 }}>
        <AparenciaCard />

        <div className="card stack gap-3">
          <h3>Identidade</h3>
          <div className="row" style={{ gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div>
              <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Logo</div>
              <image-slot
                id="loja-logo"
                shape="rounded"
                radius="20"
                style={{ width: 132, height: 132, display: 'block' }}
                placeholder="Solte sua logo aqui"
              ></image-slot>
              <div className="hint mt-2" style={{ maxWidth: 132 }}>PNG, JPG ou WEBP até 2MB</div>
            </div>
            <div className="stack gap-3" style={{ flex: 1, minWidth: 220 }}>
              <div className="field"><label>Nome da loja</label><input className="input" value={v.nome_loja} onChange={(e) => setV({...v, nome_loja: e.target.value})} /></div>
              <div className="field"><label>Descrição</label><textarea className="textarea" value={v.descricao} onChange={(e) => setV({...v, descricao: e.target.value})} /></div>
            </div>
          </div>
        </div>

        <div className="card stack gap-3">
          <h3>Contato e localização</h3>
          <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
            <div className="field" style={{ flex: 1, minWidth: 220 }}><label>Telefone</label><input className="input mono" value={v.telefone} onChange={(e) => setV({...v, telefone: e.target.value})} /></div>
            <div className="field" style={{ flex: 1, minWidth: 220 }}><label>WhatsApp</label><input className="input mono" value={v.whatsapp} onChange={(e) => setV({...v, whatsapp: e.target.value})} /></div>
          </div>
          <div className="field"><label>Endereço</label><input className="input" value={v.endereco_texto} onChange={(e) => setV({...v, endereco_texto: e.target.value})} /></div>
          <div className="field"><label>Link Google Maps</label><input className="input" value={v.maps_url} onChange={(e) => setV({...v, maps_url: e.target.value})} placeholder="https://maps.google.com/?q=..." /></div>
          <div className="field"><label>Horário de funcionamento</label><input className="input" value={v.horario_funcionamento} onChange={(e) => setV({...v, horario_funcionamento: e.target.value})} /></div>
          <div className="field"><label>Instagram (opcional)</label><input className="input" value={v.instagram_url} onChange={(e) => setV({...v, instagram_url: e.target.value})} placeholder="@suamarca" /></div>
        </div>

        <div className="card stack gap-3">
          <h3>Mensagem da vitrine</h3>
          <div className="hint">A primeira mensagem que abre quando o cliente clica em "Falar no WhatsApp" na vitrine pública.</div>
          <textarea className="textarea" value={v.mensagem_whatsapp_padrao} onChange={(e) => setV({...v, mensagem_whatsapp_padrao: e.target.value})} />
        </div>

        <MensagensEtapasCard v={v} setV={setV} />

        <div className="row" style={{ gap: 8 }}>
          <Button kind="primary" size="lg" icon="check" onClick={save}>{saved ? 'Salvo com sucesso!' : 'Salvar alterações'}</Button>
          <a className="btn lg" href="#/" target="_blank" rel="noreferrer"><Icon name="external" size={16} /> Ver vitrine</a>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   Aparência — tema claro/escuro + cor primária da marca
   ============================================================ */
const PRESET_CORES = [
  '#FF6B47', // coral (default)
  '#FF3D71', // pink
  '#FFC93B', // amarelo
  '#11A37F', // verde esmeralda
  '#2A6FDB', // azul
  '#7A5AE0', // roxo
  '#1A1413'  // grafite
];

const AparenciaCard = () => {
  const { state, dispatch } = window.useApp();
  const tema = state.loja.tema || 'claro';
  const cor = state.loja.cor_primaria || '#FF6B47';
  const [editandoHex, setEditandoHex] = React.useState(cor);
  React.useEffect(() => { setEditandoHex(cor); }, [cor]);

  const setTema = (t) => dispatch({ type: 'UPDATE_LOJA', patch: { tema: t } });
  const setCor  = (c) => dispatch({ type: 'UPDATE_LOJA', patch: { cor_primaria: c } });

  const aplicaHex = (val) => {
    const v2 = val.startsWith('#') ? val : '#' + val;
    if (/^#[0-9A-Fa-f]{6}$/.test(v2)) setCor(v2);
  };

  return (
    <div className="card stack gap-3">
      <div>
        <h3>Aparência</h3>
        <div className="hint mt-2">Tema do app e a cor da sua marca — usadas em botões, destaques e na vitrine pública.</div>
      </div>

      <div className="stack gap-2">
        <div className="muted" style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.06em' }}>Tema</div>
        <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
          <ThemeOption active={tema === 'claro'}  onClick={() => setTema('claro')}  variant="claro" />
          <ThemeOption active={tema === 'escuro'} onClick={() => setTema('escuro')} variant="escuro" />
        </div>
      </div>

      <div className="stack gap-2">
        <div className="muted" style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.06em' }}>Cor da marca</div>
        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
          {PRESET_CORES.map(c => (
            <button
              key={c}
              onClick={() => setCor(c)}
              title={c}
              style={{
                width: 36, height: 36, borderRadius: 12,
                background: c, cursor: 'pointer',
                border: cor.toLowerCase() === c.toLowerCase() ? '3px solid var(--ink)' : '1px solid var(--line)',
                boxShadow: cor.toLowerCase() === c.toLowerCase() ? '0 0 0 2px var(--bg)' : 'none'
              }}
            />
          ))}
          <label
            title="Escolher uma cor customizada"
            style={{
              width: 36, height: 36, borderRadius: 12,
              background: 'conic-gradient(from 180deg, #FF6B47, #FFC93B, #11A37F, #2A6FDB, #7A5AE0, #FF3D71, #FF6B47)',
              cursor: 'pointer',
              border: '1px solid var(--line)',
              display: 'grid', placeItems: 'center',
              position: 'relative', overflow: 'hidden'
            }}
          >
            <input
              type="color"
              value={cor}
              onChange={(e) => setCor(e.target.value)}
              style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
            />
            <Icon name="droplet" size={16} style={{ color: 'white', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,.5))' }} />
          </label>
        </div>
        <div className="row" style={{ gap: 10, alignItems: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: cor, border: '1px solid var(--line)' }} />
          <input
            className="input mono"
            value={editandoHex}
            onChange={(e) => setEditandoHex(e.target.value)}
            onBlur={() => aplicaHex(editandoHex)}
            onKeyDown={(e) => { if (e.key === 'Enter') { aplicaHex(editandoHex); e.target.blur(); } }}
            style={{ maxWidth: 140, textTransform: 'uppercase' }}
            placeholder="#FF6B47"
          />
          <div className="muted" style={{ fontSize: 12 }}>Cole o hex da sua marca aqui</div>
        </div>
      </div>

      <div className="stack gap-2">
        <div className="muted" style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.06em' }}>Preview</div>
        <div className="row" style={{ gap: 10, padding: 14, background: 'var(--bg-2)', borderRadius: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn primary">Botão primário</button>
          <button className="btn">Secundário</button>
          <span className="badge aguardando"><span className="dot" />Aguardando</span>
          <span className="badge lavando"><span className="dot" />Lavando</span>
          <span className="plate">RXY3A47</span>
        </div>
      </div>
    </div>
  );
};

const ThemeOption = ({ active, onClick, variant }) => {
  const isDark = variant === 'escuro';
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 14px',
        borderRadius: 14,
        border: active ? '2px solid var(--brand)' : '1px solid var(--line)',
        background: active ? 'color-mix(in oklab, var(--brand) 8%, var(--surface))' : 'var(--surface)',
        cursor: 'pointer', flex: 1, minWidth: 180,
        transition: 'all .15s'
      }}
    >
      <div style={{
        width: 56, height: 40, borderRadius: 10,
        background: isDark ? '#1A1816' : '#FFF6E8',
        border: '1px solid ' + (isDark ? '#2A2521' : '#EFE4D2'),
        position: 'relative', overflow: 'hidden', flex: 'none'
      }}>
        <div style={{ position: 'absolute', top: 6, left: 6, width: 16, height: 4, borderRadius: 2, background: isDark ? '#FFF8EE' : '#1A1413' }} />
        <div style={{ position: 'absolute', top: 14, left: 6, width: 28, height: 3, borderRadius: 2, background: isDark ? '#8A7D78' : '#8A7D78' }} />
        <div style={{ position: 'absolute', bottom: 6, right: 6, width: 10, height: 10, borderRadius: 4, background: 'var(--brand)' }} />
      </div>
      <div style={{ textAlign: 'left' }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>
          <Icon name={isDark ? 'droplet' : 'sun'} size={14} /> {isDark ? 'Escuro' : 'Claro'}
        </div>
        <div className="muted" style={{ fontSize: 12 }}>{isDark ? 'Pra trabalhar à noite' : 'Padrão de dia'}</div>
      </div>
    </button>
  );
};

/* ============================================================
   Editor de mensagens automáticas por etapa
   - Header (saudação + nome) e footer (link + loja) são fixos
   - Só o miolo é editável; variáveis: {{placa}} {{servico}} {{descricao}}
   ============================================================ */
const ETAPAS = [
  { key: 'entrada',    label: 'Entrada',    icon: 'car',     desc: 'Quando o carro chega', vars: ['placa', 'servico'] },
  { key: 'lavando',    label: 'Lavando',    icon: 'droplet', desc: 'Lavagem iniciou',      vars: ['placa', 'servico'] },
  { key: 'concluida',  label: 'Pronto',     icon: 'check',   desc: 'Lavagem concluída',    vars: ['placa'] },
  { key: 'retirado',   label: 'Retirado',   icon: 'key',     desc: 'Cliente levou o carro', vars: [] },
  { key: 'ocorrencia', label: 'Ocorrência', icon: 'alert',   desc: 'Algo precisa de atenção', vars: ['placa', 'descricao'] },
  { key: 'aguardando', label: 'Pra fila',   icon: 'clock',   desc: 'Voltou pra aguardando',  vars: ['placa'] }
];

const MensagensEtapasCard = ({ v, setV }) => {
  const [tab, setTab] = React.useState('entrada');
  const etapa = ETAPAS.find(e => e.key === tab);
  const tmpl = (v.mensagens_etapas && v.mensagens_etapas[tab]) ?? window.DEFAULT_TEMPLATES[tab] ?? '';

  const setTmpl = (texto) => {
    setV({ ...v, mensagens_etapas: { ...(v.mensagens_etapas || {}), [tab]: texto } });
  };
  const resetar = () => setTmpl(window.DEFAULT_TEMPLATES[tab] || '');

  // mock vars pra preview
  const previewVars = {
    nome: 'Marcelo',
    placa: 'RXY3A47',
    servico: 'Lavagem completa',
    lojaNome: v.nome_loja || 'sua loja',
    link: `${location.origin}${location.pathname}#/a/lr_demo123`,
    descricao: 'Cliente esqueceu de deixar a chave reserva'
  };
  const bodyPreview = window.fillTemplate(tmpl, previewVars);
  const headerPreview = `Olá, ${previewVars.nome}! 👋`;
  const includeLink = tab !== 'retirado';
  const footerPreview = window.waFooter(previewVars, includeLink);
  const fullPreview = `${headerPreview}\n\n${bodyPreview}\n\n${footerPreview}`;

  const insertVar = (name) => {
    const tag = `{{${name}}}`;
    setTmpl((tmpl || '') + (tmpl && !tmpl.endsWith(' ') && !tmpl.endsWith('\n') ? ' ' : '') + tag);
  };

  return (
    <div className="card stack gap-3">
      <div>
        <h3>Mensagens automáticas por etapa</h3>
        <div className="hint mt-2">
          A saudação com o nome do cliente e o link de acompanhamento ficam fixos. Você edita só o miolo de cada etapa.
        </div>
      </div>

      {/* Tabs */}
      <div className="row wrap" style={{ gap: 6 }}>
        {ETAPAS.map(e => (
          <button
            key={e.key}
            className={`btn sm ${tab === e.key ? 'primary' : ''}`}
            onClick={() => setTab(e.key)}
          >
            <Icon name={e.icon} size={14} /> {e.label}
          </button>
        ))}
      </div>

      {/* Header fixo */}
      <div className="stack gap-2">
        <div className="muted" style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.06em' }}>Saudação (fixo)</div>
        <div style={{ background: 'var(--bg-2)', padding: '10px 14px', borderRadius: 12, fontSize: 14, fontFamily: 'var(--font-mono)', color: 'var(--ink-2)' }}>
          Olá, <span style={{ color: 'var(--brand)', fontWeight: 700 }}>{`{nome_cliente}`}</span>! 👋
        </div>
      </div>

      {/* Body editável */}
      <div className="stack gap-2">
        <div className="row between">
          <div className="muted" style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.06em' }}>
            Mensagem da etapa <span style={{ color: 'var(--brand)' }}>· {etapa.label}</span>
          </div>
          <Button kind="ghost" size="sm" onClick={resetar} title="Voltar ao padrão">Resetar</Button>
        </div>
        <textarea
          className="textarea"
          value={tmpl}
          onChange={(e) => setTmpl(e.target.value)}
          rows={4}
          placeholder="Escreva a mensagem dessa etapa..."
        />
        <div className="row wrap" style={{ gap: 6 }}>
          <span className="muted" style={{ fontSize: 12, alignSelf: 'center' }}>Inserir:</span>
          {etapa.vars.map(varName => (
            <button key={varName} className="btn sm" style={{ height: 28, fontSize: 12, padding: '0 8px' }} onClick={() => insertVar(varName)}>
              {`{{${varName}}}`}
            </button>
          ))}
        </div>
      </div>

      {/* Footer fixo */}
      <div className="stack gap-2">
        <div className="muted" style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.06em' }}>Assinatura (fixo)</div>
        <div style={{ background: 'var(--bg-2)', padding: '10px 14px', borderRadius: 12, fontSize: 14, fontFamily: 'var(--font-mono)', color: 'var(--ink-2)', lineHeight: 1.5 }}>
          {includeLink && <>Acompanhe por aqui:<br /><span style={{ color: 'var(--sky)' }}>{`{link_acompanhamento}`}</span><br /><br /></>}
          — Equipe <span style={{ color: 'var(--brand)', fontWeight: 700 }}>{`{nome_loja}`}</span>
        </div>
      </div>

      {/* Preview */}
      <div className="stack gap-2">
        <div className="muted" style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.06em' }}>Preview no WhatsApp</div>
        <div className="wa-chat">
          <div className="wa-bubble">
            {fullPreview}
            <span className="time">{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

window.ConfiguracoesScreen = ConfiguracoesScreen;
