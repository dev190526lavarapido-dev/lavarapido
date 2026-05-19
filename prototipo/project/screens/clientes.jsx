/* ============================================================
   Clientes — lista + detalhe + cadastro de cliente/veículo
   ============================================================ */
const ClientesScreen = () => {
  const { state, dispatch } = window.useApp();
  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState(null);
  const [showNew, setShowNew] = React.useState(false);

  const items = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return state.clientes
      .map(c => {
        const veiculos = state.veiculos.filter(v => v.cliente_id === c.id);
        const lavagens = state.lavagens.filter(l => l.cliente_id === c.id);
        return { ...c, veiculos, lavagens };
      })
      .filter(c => {
        if (!q) return true;
        return c.nome.toLowerCase().includes(q) ||
               c.whatsapp.toLowerCase().includes(q) ||
               c.veiculos.some(v => v.placa.toLowerCase().includes(q) || v.modelo?.toLowerCase().includes(q));
      })
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [search, state.clientes, state.veiculos, state.lavagens]);

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">Clientes</div>
          <div className="page-sub">{state.clientes.length} no total, {state.veiculos.length} veículos.</div>
        </div>
        <div className="actions">
          <Button icon="plus" kind="primary" onClick={() => setShowNew(true)}>Novo cliente</Button>
        </div>
      </div>

      <div className="search-pill mt-2" style={{ marginBottom: 14 }}>
        <Icon name="search" size={16} />
        <input placeholder="Buscar por nome, placa ou WhatsApp..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="row-list">
        {items.map((c, i) => (
          <div className="row-item" key={c.id} onClick={() => setSelected(c.id)}>
            <div className={`avatar avatar-color-${i % 5}`}>{initials(c.nome)}</div>
            <div className="grow">
              <div className="title">{c.nome}</div>
              <div className="sub mono">{c.whatsapp}</div>
              <div className="row mt-2" style={{ gap: 6, flexWrap: 'wrap' }}>
                {c.veiculos.map(v => <span className="plate" key={v.id} style={{ fontSize: 10 }}>{v.placa}</span>)}
              </div>
            </div>
            <div className="right">{c.lavagens.length} lavagens</div>
          </div>
        ))}
        {items.length === 0 && <div className="muted center" style={{ padding: 24 }}>Ninguém aqui ainda.</div>}
      </div>

      {selected && <ClienteDetalhe clienteId={selected} onClose={() => setSelected(null)} />}
      {showNew && <NovoClienteModal onClose={() => setShowNew(false)} />}
    </div>
  );
};

const ClienteDetalhe = ({ clienteId, onClose }) => {
  const { state, dispatch } = window.useApp();
  const c = state.clientes.find(c => c.id === clienteId);
  const veiculos = state.veiculos.filter(v => v.cliente_id === clienteId);
  const lavagens = state.lavagens.filter(l => l.cliente_id === clienteId).sort((a,b) => new Date(b.entrada_em) - new Date(a.entrada_em));
  if (!c) return null;
  return (
    <Modal title={c.nome} onClose={onClose}>
      <div className="row between" style={{ marginBottom: 12 }}>
        <div className="muted mono" style={{ fontSize: 13 }}>{c.whatsapp}</div>
        <Button kind="whats" size="sm" icon="whats" onClick={() => window.open(waLink(c.whatsapp, 'Oi! Tudo bem?'))}>WhatsApp</Button>
      </div>

      <h3 style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.06em' }}>Veículos</h3>
      <div className="stack gap-2 mt-2">
        {veiculos.map(v => (
          <div key={v.id} className="row between" style={{ padding: 10, border: '1px solid var(--line)', borderRadius: 12 }}>
            <div>
              <div className="row" style={{ gap: 8 }}>
                <span className="plate">{v.placa}</span>
                <span style={{ fontWeight: 600 }}>{v.modelo}</span>
              </div>
              <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{v.cor}</div>
            </div>
          </div>
        ))}
      </div>

      <h3 className="mt-4" style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.06em' }}>Histórico</h3>
      <div className="stack gap-2">
        {lavagens.map(l => {
          const s = state.servicos.find(s => s.id === l.servico_id);
          const v = state.veiculos.find(v => v.id === l.veiculo_id);
          return (
            <div key={l.id} className="row between" style={{ padding: 10, border: '1px solid var(--line)', borderRadius: 12, cursor: 'pointer' }} onClick={() => { onClose(); dispatch({ type: 'VIEW_LAVAGEM', id: l.id }); }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{s?.nome}</div>
                <div className="muted" style={{ fontSize: 12 }}>{v?.placa} · {formatHM(l.entrada_em)}</div>
              </div>
              <StatusBadge status={l.status_atual} size="sm" />
            </div>
          );
        })}
        {lavagens.length === 0 && <div className="muted center" style={{ padding: 12, fontSize: 13 }}>Sem histórico ainda.</div>}
      </div>
    </Modal>
  );
};

const NovoClienteModal = ({ onClose }) => {
  const { dispatch } = window.useApp();
  const [cli, setCli] = React.useState({ nome: '', whatsapp: '' });
  const [vei, setVei] = React.useState({ placa: '', modelo: '', cor: '' });
  const ok = cli.nome.trim() && cli.whatsapp.trim() && vei.placa.trim();
  const save = () => {
    if (!ok) return;
    const cId = "c_" + Date.now();
    const vId = "v_" + Date.now();
    dispatch({ type: 'ADD_CLIENTE', cliente: { id: cId, nome: cli.nome, whatsapp: cli.whatsapp } });
    dispatch({ type: 'ADD_VEICULO', veiculo: { id: vId, cliente_id: cId, placa: vei.placa.toUpperCase(), modelo: vei.modelo, cor: vei.cor } });
    onClose();
  };
  return (
    <Modal title="Novo cliente" onClose={onClose}
      footer={<><Button kind="ghost" onClick={onClose}>Cancelar</Button><div className="spacer" /><Button kind="primary" disabled={!ok} onClick={save}>Salvar</Button></>}
    >
      <div className="stack gap-3">
        <div className="field"><label>Nome</label><input className="input" value={cli.nome} onChange={(e) => setCli({...cli, nome: e.target.value})} placeholder="Ex: Marcelo Andrade" autoFocus /></div>
        <div className="field"><label>WhatsApp</label><input className="input mono" value={cli.whatsapp} onChange={(e) => setCli({...cli, whatsapp: e.target.value})} placeholder="+55 11 9..." /></div>
        <div className="row mt-2" style={{ gap: 10 }}>
          <div className="field" style={{ flex: 1 }}><label>Placa</label><input className="input mono" value={vei.placa} onChange={(e) => setVei({...vei, placa: e.target.value.toUpperCase()})} placeholder="ABC1D23" /></div>
          <div className="field" style={{ flex: 1 }}><label>Cor</label><input className="input" value={vei.cor} onChange={(e) => setVei({...vei, cor: e.target.value})} placeholder="Prata" /></div>
        </div>
        <div className="field"><label>Modelo</label><input className="input" value={vei.modelo} onChange={(e) => setVei({...vei, modelo: e.target.value})} placeholder="Honda Civic" /></div>
      </div>
    </Modal>
  );
};

window.ClientesScreen = ClientesScreen;
