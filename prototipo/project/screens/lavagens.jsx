/* ============================================================
   Lavagens — Kanban + filtros por status (mobile-first)
   ============================================================ */
const COLS = [
  { key: 'aguardando_lavagem',  title: 'Aguardando', short: 'Aguardando', color: 'var(--st-aguardando)' },
  { key: 'lavando',             title: 'Lavando',    short: 'Lavando',    color: 'var(--st-lavando)' },
  { key: 'lavagem_concluida',   title: 'Pronto',     short: 'Pronto',     color: 'var(--st-concluida)' },
  { key: 'ocorrencia',          title: 'Ocorrência', short: 'Ocorrência', color: 'var(--st-ocorrencia)' },
  { key: 'retirado',            title: 'Retirado',   short: 'Retirado',   color: 'var(--st-retirado)' }
];

const allowedNext = {
  aguardando_lavagem: ['lavando', 'ocorrencia'],
  lavando: ['aguardando_lavagem', 'lavagem_concluida', 'ocorrencia'],
  lavagem_concluida: ['lavando', 'retirado', 'ocorrencia'],
  ocorrencia: ['aguardando_lavagem', 'lavando'],
  retirado: []
};

const LavagensScreen = () => {
  const { state, dispatch } = window.useApp();
  const [dragId, setDragId] = React.useState(null);
  const [hoverCol, setHoverCol] = React.useState(null);
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState('todos'); // 'todos' | status key

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return state.lavagens;
    return state.lavagens.filter(l => {
      const c = state.clientes.find(c => c.id === l.cliente_id);
      const v = state.veiculos.find(v => v.id === l.veiculo_id);
      return (c?.nome.toLowerCase().includes(q) || v?.placa.toLowerCase().includes(q) || v?.modelo?.toLowerCase().includes(q));
    });
  }, [search, state.lavagens, state.clientes, state.veiculos]);

  const byStatus = (key) => filtered.filter(l => l.status_atual === key);
  const counts = React.useMemo(() => {
    const c = { todos: filtered.length };
    COLS.forEach(col => c[col.key] = byStatus(col.key).length);
    return c;
  }, [filtered]);

  const handleDrop = (colKey, lavagemId) => {
    setDragId(null); setHoverCol(null);
    if (!lavagemId) return;
    const lav = state.lavagens.find(l => l.id === lavagemId);
    if (!lav || lav.status_atual === colKey) return;
    if (!allowedNext[lav.status_atual]?.includes(colKey)) return;
    if (colKey === 'ocorrencia') {
      dispatch({ type: 'OPEN_OCORRENCIA', id: lavagemId });
      return;
    }
    dispatch({ type: 'CHANGE_STATUS', id: lavagemId, status: colKey });
  };

  const visibleCols = filter === 'todos' ? COLS : COLS.filter(c => c.key === filter);

  const renderCol = (col) => {
    const items = byStatus(col.key);
    return (
      <div
        key={col.key}
        className={`kanban-col ${hoverCol === col.key ? 'is-drop-target' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setHoverCol(col.key); }}
        onDragLeave={() => setHoverCol(prev => prev === col.key ? null : prev)}
        onDrop={(e) => { e.preventDefault(); handleDrop(col.key, dragId); }}
      >
        <div className="kanban-col-head">
          <span className="marker" style={{ background: col.color }} />
          <h3>{col.title}</h3>
          <span className="count">{items.length}</span>
        </div>
        {items.length === 0 && (
          <div className="muted center" style={{ fontSize: 12, padding: '14px 6px' }}>
            {filter === 'todos' ? 'Vazio' : 'Nenhuma lavagem aqui agora 👌'}
          </div>
        )}
        {items.map(l => (
          <LavagemCard key={l.id} lavagem={l} setDragId={setDragId} dragId={dragId} />
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">Lavagens</div>
          <div className="page-sub hide-mobile">Arrasta o card pra outra coluna ou toca pra ver detalhes.</div>
          <div className="page-sub hide-desktop">Toca o card pra ver detalhes e mudar status.</div>
        </div>
        <div className="actions">
          <Button icon="plus" kind="primary" onClick={() => dispatch({ type: 'NAVIGATE', route: 'nova-lavagem' })}>Nova lavagem</Button>
        </div>
      </div>

      <div className="search-pill mt-2" style={{ marginBottom: 10 }}>
        <Icon name="search" size={16} />
        <input placeholder="Buscar por placa, cliente ou modelo..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Filtro por status — mostra contagem */}
      <div className="filter-chips" style={{ marginBottom: 14 }}>
        <FilterChip active={filter === 'todos'} onClick={() => setFilter('todos')} count={counts.todos}>
          Todos
        </FilterChip>
        {COLS.map(col => (
          <FilterChip
            key={col.key}
            active={filter === col.key}
            onClick={() => setFilter(col.key)}
            color={col.color}
            count={counts[col.key]}
          >
            {col.short}
          </FilterChip>
        ))}
      </div>

      {filter === 'todos' ? (
        <div className="kanban-wrap">
          <div className="kanban">
            {visibleCols.map(renderCol)}
          </div>
        </div>
      ) : (
        <div className="single-col-wrap">
          {visibleCols.map(renderCol)}
        </div>
      )}
    </div>
  );
};

const FilterChip = ({ active, onClick, count, color, children }) => (
  <button
    className={`filter-chip ${active ? 'active' : ''}`}
    onClick={onClick}
  >
    {color && <span className="chip-dot" style={{ background: color }} />}
    <span className="chip-label">{children}</span>
    <span className="chip-count">{count}</span>
  </button>
);

const LavagemCard = ({ lavagem, setDragId, dragId }) => {
  const { state, dispatch } = window.useApp();
  const c = state.clientes.find(c => c.id === lavagem.cliente_id);
  const v = state.veiculos.find(v => v.id === lavagem.veiculo_id);
  const s = state.servicos.find(s => s.id === lavagem.servico_id);

  const nexts = allowedNext[lavagem.status_atual] || [];
  const fwdStatus = (() => {
    if (lavagem.status_atual === 'aguardando_lavagem') return 'lavando';
    if (lavagem.status_atual === 'lavando') return 'lavagem_concluida';
    if (lavagem.status_atual === 'lavagem_concluida') return 'retirado';
    if (lavagem.status_atual === 'ocorrencia') return 'lavando';
    return null;
  })();

  const fwdLabel = ({
    lavando: 'Iniciar',
    lavagem_concluida: 'Concluir',
    retirado: 'Retirar',
  })[fwdStatus] || 'Avançar';

  const onFwd = (e) => {
    e.stopPropagation();
    if (!fwdStatus) return;
    dispatch({ type: 'CHANGE_STATUS', id: lavagem.id, status: fwdStatus });
  };
  const onOcorrencia = (e) => {
    e.stopPropagation();
    dispatch({ type: 'OPEN_OCORRENCIA', id: lavagem.id });
  };
  const onOpen = () => dispatch({ type: 'VIEW_LAVAGEM', id: lavagem.id });
  const onWhats = (e) => {
    e.stopPropagation();
    const tipo = ({
      aguardando_lavagem: 'entrada',
      lavando: 'lavando',
      lavagem_concluida: 'concluida',
      ocorrencia: 'ocorrencia',
      retirado: 'manual'
    })[lavagem.status_atual] || 'manual';
    dispatch({ type: 'OPEN_WHATSAPP', id: lavagem.id, tipo });
  };

  return (
    <div
      className={`lavagem-card ${dragId === lavagem.id ? 'dragging' : ''} ${lavagem.status_atual === 'ocorrencia' ? 'ocorrencia-mark' : ''}`}
      draggable={lavagem.status_atual !== 'retirado'}
      onDragStart={(e) => { setDragId(lavagem.id); e.dataTransfer.effectAllowed = 'move'; }}
      onDragEnd={() => setDragId(null)}
      onClick={onOpen}
    >
      <div className="row between">
        <span className="plate">{v?.placa}</span>
        <span className="valor">{moneyBR(lavagem.valor)}</span>
      </div>
      <div>
        <div className="nome">{c?.nome}</div>
        <div className="servico">{s?.nome} · {v?.modelo}</div>
      </div>
      {lavagem.status_atual === 'ocorrencia' && lavagem.ocorrencia_descricao && (
        <div style={{ fontSize: 12, color: 'var(--rose)', background: 'color-mix(in oklab, var(--rose) 8%, transparent)', padding: '6px 8px', borderRadius: 8, lineHeight: 1.4 }}>
          ⚠ {lavagem.ocorrencia_descricao}
        </div>
      )}
      <div className="row between">
        <span className="meta"><Icon name="clock" size={12} /> {formatHM(lavagem.entrada_em)}</span>
      </div>
      {lavagem.status_atual !== 'retirado' && (
        <div className="acoes">
          {fwdStatus && nexts.includes(fwdStatus) && (
            <button className={`btn sm ${fwdStatus === 'retirado' ? 'success' : 'primary'}`} onClick={onFwd}>
              <Icon name={fwdStatus === 'retirado' ? 'key' : 'fwd'} size={14} /> {fwdLabel}
            </button>
          )}
          {lavagem.status_atual !== 'ocorrencia' && (
            <button className="btn sm" onClick={onOcorrencia} title="Marcar ocorrência">
              <Icon name="alert" size={14} />
            </button>
          )}
          <button className="btn sm btn-whats" onClick={onWhats} title="WhatsApp">
            <Icon name="whats" size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

window.LavagensScreen = LavagensScreen;
