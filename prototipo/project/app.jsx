/* ============================================================
   Lava Rápido Marquinhos — main app: state, routing, layout
   ============================================================ */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "sol-coral"
}/*EDITMODE-END*/;

const PALETTE_KEY = {
  "sol-coral": "default",
  "esmeralda": "esmeralda",
  "tropical":  "tropical",
  "noturno":   "noturno"
};

const INITIAL_STATE = {
  authed: true, // já entra no painel
  route: 'dashboard',
  publicToken: null,
  loja: window.LRMock.loja,
  servicos: window.LRMock.servicos,
  clientes: window.LRMock.clientes,
  veiculos: window.LRMock.veiculos,
  lavagens: window.LRMock.lavagens,
  selectedLavagemId: null,
  ocorrenciaLavagemId: null,
  whatsapp: null, // { lavagemId, tipo }
  simulating: false,
  lastCreatedId: null
};

const tokOf = (s) => "lr_" + s + Math.random().toString(36).slice(2,8);

function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN':  return { ...state, authed: true, route: 'dashboard' };
    case 'LOGOUT': return { ...state, authed: false, route: 'login' };
    case 'NAVIGATE': return { ...state, route: action.route, publicToken: null };
    case 'NAVIGATE_PUBLIC_LOJA': {
      const enc = action.params?.encerrada;
      const newHash = enc ? '#/?lavagem=encerrada' : '#/';
      if (location.hash !== newHash) location.hash = newHash;
      return { ...state, route: 'publica-loja', publicToken: null };
    }
    case 'NAVIGATE_PUBLIC_TOKEN':
      return { ...state, route: 'publica-token', publicToken: action.token };
    case 'VIEW_LAVAGEM': return { ...state, selectedLavagemId: action.id };
    case 'CLOSE_LAVAGEM': return { ...state, selectedLavagemId: null };
    case 'OPEN_OCORRENCIA': return { ...state, ocorrenciaLavagemId: action.id };
    case 'CLOSE_OCORRENCIA': return { ...state, ocorrenciaLavagemId: null };
    case 'OPEN_WHATSAPP': return { ...state, whatsapp: { lavagemId: action.id, tipo: action.tipo || 'manual' } };
    case 'OPEN_WHATSAPP_LAST': return state.lastCreatedId ? { ...state, whatsapp: { lavagemId: state.lastCreatedId, tipo: action.tipo || 'entrada' } } : state;
    case 'CLOSE_WHATSAPP': return { ...state, whatsapp: null };
    case 'TOGGLE_SIMULATION': return { ...state, simulating: !state.simulating };

    case 'CHANGE_STATUS': {
      const lavagens = state.lavagens.map(l => {
        if (l.id !== action.id) return l;
        const now = new Date().toISOString();
        const novoEvento = { status: action.status, descricao: descricaoPadrao(action.status), t: now };
        const updated = {
          ...l,
          status_atual: action.status,
          ativa: action.status === 'retirado' ? false : l.ativa,
          retirada_em: action.status === 'retirado' ? now : l.retirada_em,
          eventos: [...l.eventos, novoEvento]
        };
        return updated;
      });
      // a cada mudança manual, abre o preview do WhatsApp; simulação passa silent=true
      const next = { ...state, lavagens };
      if (!action.silent) {
        const tipo = window.tipoMsgParaStatus ? window.tipoMsgParaStatus(action.status) : 'manual';
        next.whatsapp = { lavagemId: action.id, tipo };
      }
      return next;
    }
    case 'SET_OCORRENCIA': {
      const lavagens = state.lavagens.map(l => {
        if (l.id !== action.id) return l;
        const now = new Date().toISOString();
        return {
          ...l,
          status_atual: 'ocorrencia',
          ocorrencia_descricao: action.descricao,
          eventos: [...l.eventos, { status: 'ocorrencia', descricao: action.descricao, t: now }]
        };
      });
      // ocorrência sempre dispara aviso pro cliente
      return { ...state, lavagens, ocorrenciaLavagemId: null, whatsapp: { lavagemId: action.id, tipo: 'ocorrencia' } };
    }
    case 'ADD_LAVAGEM': {
      const id = "lv_" + Date.now();
      const now = new Date().toISOString();
      const nova = {
        id,
        cliente_id: action.cliente_id, veiculo_id: action.veiculo_id, servico_id: action.servico_id,
        token_publico: tokOf("nv"), status_atual: 'aguardando_lavagem', ativa: true,
        valor: action.valor, observacao: action.observacao || '',
        ocorrencia_descricao: '',
        entrada_em: now, retirada_em: null,
        eventos: [
          { status: 'entrada', descricao: 'Carro deu entrada', t: now },
          { status: 'aguardando_lavagem', descricao: 'Aguardando lavagem', t: now }
        ]
      };
      return { ...state, lavagens: [nova, ...state.lavagens], lastCreatedId: id };
    }
    case 'ADD_CLIENTE': return { ...state, clientes: [action.cliente, ...state.clientes] };
    case 'ADD_VEICULO': return { ...state, veiculos: [action.veiculo, ...state.veiculos] };
    case 'UPDATE_LOJA':  return { ...state, loja: { ...state.loja, ...action.patch } };
    case 'TOGGLE_SERVICO': return { ...state, servicos: state.servicos.map(s => s.id === action.id ? { ...s, ativo: !s.ativo } : s) };
    case 'ADD_SERVICO': return { ...state, servicos: [...state.servicos, action.servico] };
    case 'UPDATE_SERVICO': return { ...state, servicos: state.servicos.map(s => s.id === action.id ? { ...s, ...action.patch } : s) };
    case 'LOG_WHATSAPP': return state; // poderia gravar tabela; MVP só fecha
    case 'SIM_TICK': return simTick(state);
    default: return state;
  }
}

function descricaoPadrao(status) {
  return ({
    aguardando_lavagem: 'Aguardando lavagem',
    lavando: 'Lavagem iniciada',
    lavagem_concluida: 'Lavagem concluída — pronto pra retirada',
    ocorrencia: 'Ocorrência registrada',
    retirado: 'Carro retirado pelo cliente'
  })[status] || status;
}

// Avança a primeira lavagem que dá pra avançar; rotação de prioridade
// (silent: não abre o modal de WhatsApp durante simulação)
function simTick(state) {
  const ordem = ['aguardando_lavagem', 'lavando', 'lavagem_concluida'];
  for (const st of ordem) {
    const cand = state.lavagens.find(l => l.status_atual === st && l.ativa);
    if (cand) {
      const next = ({ aguardando_lavagem: 'lavando', lavando: 'lavagem_concluida', lavagem_concluida: 'retirado' })[st];
      const now = new Date().toISOString();
      return {
        ...state,
        lavagens: state.lavagens.map(l => l.id === cand.id ? {
          ...l,
          status_atual: next,
          ativa: next === 'retirado' ? false : l.ativa,
          retirada_em: next === 'retirado' ? now : l.retirada_em,
          eventos: [...l.eventos, { status: next, descricao: descricaoPadrao(next), t: now }]
        } : l)
      };
    }
  }
  return state;
}

/* =================== APP CONTEXT =================== */
window.LRAppContext = React.createContext(null);
window.useApp = () => React.useContext(window.LRAppContext);

/* =================== HASH ROUTER =================== */
function parseHash() {
  const h = location.hash || '#/';
  if (h.startsWith('#/a/')) {
    return { route: 'publica-token', token: h.slice(4).split('?')[0] };
  }
  if (h === '#/' || h.startsWith('#/?')) {
    return { route: 'publica-loja' };
  }
  if (h.startsWith('#/login')) return { route: 'login' };
  if (h.startsWith('#/gestor/')) {
    const r = h.replace('#/gestor/', '').split('?')[0];
    if (['dashboard','lavagens','nova-lavagem','clientes','catalogo','configuracoes'].includes(r)) return { route: r };
    return { route: 'dashboard' };
  }
  return { route: 'dashboard' };
}

function syncHash(state) {
  if (state.route === 'publica-loja') return;
  if (state.route === 'publica-token') return;
  const want = '#/gestor/' + state.route;
  if (!location.hash.startsWith(want)) location.hash = want;
}

/* =================== LAYOUT BITS =================== */
const NAV_ITEMS = [
  { route: 'dashboard',     label: 'Dashboard',  icon: 'dashboard' },
  { route: 'lavagens',      label: 'Lavagens',   icon: 'kanban' },
  { route: 'nova-lavagem',  label: 'Nova',       icon: 'plus', cta: true },
  { route: 'clientes',      label: 'Clientes',   icon: 'users' },
  { route: 'catalogo',      label: 'Catálogo',   icon: 'tag' }
];

const Topbar = () => {
  const { state, dispatch } = window.useApp();
  return (
    <div className="topbar">
      <div className="brand-mark">
        <span className="dot">LR</span>
        <span className="hide-mobile">{state.loja.nome_loja}</span>
      </div>
      <div className="grow" />
      <div className="top-actions">
        <a href="#/" className="btn ghost sm" title="Vitrine pública" onClick={(e) => { e.preventDefault(); location.hash = '#/'; }}>
          <Icon name="store" size={14} /> <span className="hide-mobile">Vitrine</span>
        </a>
        <Button
          kind="ghost"
          size="sm"
          icon="gear"
          onClick={() => dispatch({ type: 'NAVIGATE', route: 'configuracoes' })}
          title="Configurações"
          aria-label="Configurações"
          className={state.route === 'configuracoes' ? 'is-active' : ''}
        />
        <Button kind="ghost" size="sm" icon="logout" onClick={() => dispatch({ type: 'LOGOUT' })} title="Sair" />
      </div>
    </div>
  );
};

const Sidebar = () => {
  const { state, dispatch } = window.useApp();
  const items = [...NAV_ITEMS.filter(i => !i.cta), { route: 'configuracoes', label: 'Configurações', icon: 'gear' }];
  return (
    <nav className="sidebar">
      <div className="nav-section">Operação</div>
      <Button kind="primary" icon="plus" onClick={() => dispatch({ type: 'NAVIGATE', route: 'nova-lavagem' })}>Nova lavagem</Button>
      <div style={{ height: 12 }} />
      {items.map(it => (
        <div key={it.route} className={`nav-item ${state.route === it.route ? 'active' : ''}`} onClick={() => dispatch({ type: 'NAVIGATE', route: it.route })}>
          <Icon name={it.icon} size={18} /> {it.label}
        </div>
      ))}
    </nav>
  );
};

const BottomBar = () => {
  const { state, dispatch } = window.useApp();
  return (
    <nav className="bottombar">
      {NAV_ITEMS.map(it => (
        <button key={it.route} className={`tab ${state.route === it.route ? 'active' : ''} ${it.cta ? 'cta' : ''}`} onClick={() => dispatch({ type: 'NAVIGATE', route: it.route })}>
          <Icon name={it.icon} size={it.cta ? 24 : 20} />
          <span>{it.label}</span>
        </button>
      ))}
    </nav>
  );
};

/* =================== GESTOR SHELL =================== */
const GestorShell = ({ children }) => (
  <div className="app-shell">
    <Topbar />
    <Sidebar />
    <main className="main">{children}</main>
    <BottomBar />
  </div>
);

/* =================== ROOT APP =================== */
const App = () => {
  const [state, dispatch] = React.useReducer(reducer, INITIAL_STATE);
  const [tweaks, setTweak] = (window.useTweaks ? window.useTweaks(TWEAK_DEFAULTS) : [TWEAK_DEFAULTS, () => {}]);

  // hash routing — both ways
  React.useEffect(() => {
    const onHash = () => {
      const p = parseHash();
      if (p.route === 'publica-token') dispatch({ type: 'NAVIGATE_PUBLIC_TOKEN', token: p.token });
      else if (p.route === 'publica-loja') dispatch({ type: 'NAVIGATE_PUBLIC_LOJA' });
      else if (p.route === 'login') dispatch({ type: 'LOGOUT' });
      else dispatch({ type: 'NAVIGATE', route: p.route });
    };
    window.addEventListener('hashchange', onHash);
    // initial — only set from hash if it's a public route, otherwise stay on dashboard
    const initial = parseHash();
    if (initial.route === 'publica-token') dispatch({ type: 'NAVIGATE_PUBLIC_TOKEN', token: initial.token });
    else if (initial.route === 'publica-loja') dispatch({ type: 'NAVIGATE_PUBLIC_LOJA' });
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  React.useEffect(() => { syncHash(state); }, [state.route]);

  // palette (Tweaks exploration)
  React.useEffect(() => {
    const key = PALETTE_KEY[tweaks.palette] || 'default';
    if (key === 'default') document.documentElement.removeAttribute('data-palette');
    else document.documentElement.setAttribute('data-palette', key);
  }, [tweaks.palette]);

  // tema + cor primária (Configurações da loja)
  React.useEffect(() => {
    const tema = state.loja.tema || 'claro';
    if (tema === 'escuro') document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
  }, [state.loja.tema]);

  React.useEffect(() => {
    const brand = state.loja.cor_primaria;
    if (!brand) return;
    // compute contrast color for text on brand
    const h = brand.replace('#', '');
    if (h.length !== 6) return;
    const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i+2), 16) / 255);
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const ink = lum > 0.6 ? '#1A1413' : '#FFFFFF';
    document.documentElement.style.setProperty('--brand', brand);
    document.documentElement.style.setProperty('--brand-ink', ink);
  }, [state.loja.cor_primaria]);

  // simulation tick
  React.useEffect(() => {
    if (!state.simulating) return;
    const t = setInterval(() => dispatch({ type: 'SIM_TICK' }), 4000);
    return () => clearInterval(t);
  }, [state.simulating]);

  const ctxValue = React.useMemo(() => ({ state, dispatch }), [state]);

  return (
    <window.LRAppContext.Provider value={ctxValue}>
      {!state.authed ? <LoginScreen /> :
       state.route === 'publica-loja' ? <PublicaLojaScreen /> :
       state.route === 'publica-token' ? <PublicaTokenScreen /> :
       <GestorShell>
         {state.route === 'dashboard'      && <DashboardScreen />}
         {state.route === 'lavagens'       && <LavagensScreen />}
         {state.route === 'nova-lavagem'   && <NovaLavagemScreen />}
         {state.route === 'clientes'       && <ClientesScreen />}
         {state.route === 'catalogo'       && <CatalogoScreen />}
         {state.route === 'configuracoes'  && <ConfiguracoesScreen />}
       </GestorShell>}

      {state.selectedLavagemId   && <LavagemDetalhe lavagemId={state.selectedLavagemId}   onClose={() => dispatch({ type: 'CLOSE_LAVAGEM' })} />}
      {state.ocorrenciaLavagemId && <OcorrenciaModal lavagemId={state.ocorrenciaLavagemId} onClose={() => dispatch({ type: 'CLOSE_OCORRENCIA' })} />}
      {state.whatsapp            && <WhatsAppModal lavagemId={state.whatsapp.lavagemId} tipo={state.whatsapp.tipo} onClose={() => dispatch({ type: 'CLOSE_WHATSAPP' })} />}

      <LRTweaks tweaks={tweaks} setTweak={setTweak} />
    </window.LRAppContext.Provider>
  );
};

/* =================== TWEAKS PANEL =================== */
const PALETTE_OPTIONS = [
  { value: 'sol-coral', label: 'Sol & Coral', colors: ['#FF6B47', '#FFC93B', '#FFF6E8', '#2BB591'] },
  { value: 'esmeralda', label: 'Esmeralda',   colors: ['#11A37F', '#F2C94C', '#F1FAF5', '#4FA8E0'] },
  { value: 'tropical',  label: 'Tropical',    colors: ['#FF3D71', '#FFC93B', '#FFF1F0', '#2BB591'] },
  { value: 'noturno',   label: 'Noturno',     colors: ['#FFC93B', '#FF6B47', '#0F0E0C', '#4ADE80'] }
];

const PaletteSwatch = ({ option, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex', flexDirection: 'column', gap: 8,
      padding: 10, borderRadius: 14,
      border: active ? '2px solid #1A1413' : '1px solid #00000018',
      background: active ? '#fff' : '#fafafa',
      cursor: 'pointer', textAlign: 'left',
      transition: 'all .15s',
      flex: 1, minWidth: 0
    }}
  >
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 3, height: 36, borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: option.colors[0] }} />
      <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 3 }}>
        <div style={{ background: option.colors[1] }} />
        <div style={{ background: option.colors[3] }} />
      </div>
      <div style={{ background: option.colors[2], border: option.colors[2].toLowerCase().includes('fff') ? '1px solid #00000010' : 'none' }} />
    </div>
    <div style={{ fontSize: 12, fontWeight: 600, color: '#1A1413' }}>{option.label}</div>
  </button>
);

const LRTweaks = ({ tweaks, setTweak }) => {
  if (!window.TweaksPanel) return null;
  const { TweaksPanel, TweakSection } = window;
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Paleta" subtitle="Vibe brasileira em 4 humores">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {PALETTE_OPTIONS.map(opt => (
            <PaletteSwatch key={opt.value} option={opt} active={tweaks.palette === opt.value} onClick={() => setTweak('palette', opt.value)} />
          ))}
        </div>
      </TweakSection>
    </TweaksPanel>
  );
};

/* =================== MOUNT =================== */
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
