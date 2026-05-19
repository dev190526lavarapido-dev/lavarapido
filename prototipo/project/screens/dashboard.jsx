/* ============================================================
   Dashboard — visão do dia
   ============================================================ */
const DashboardScreen = () => {
  const { state, dispatch } = window.useApp();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isToday = (iso) => {
    if (!iso) return false;
    const d = new Date(iso);
    const c = new Date(d); c.setHours(0,0,0,0);
    return c.getTime() === today.getTime();
  };

  const stats = React.useMemo(() => {
    const ag = state.lavagens.filter(l => l.status_atual === 'aguardando_lavagem');
    const lv = state.lavagens.filter(l => l.status_atual === 'lavando');
    const co = state.lavagens.filter(l => l.status_atual === 'lavagem_concluida');
    const oc = state.lavagens.filter(l => l.status_atual === 'ocorrencia');
    const rt = state.lavagens.filter(l => l.status_atual === 'retirado');
    const ent = state.lavagens.filter(l => isToday(l.entrada_em));
    const faturamentoPrevisto = ent.reduce((s, l) => s + Number(l.valor || 0), 0);
    const dinheiroRecebido = rt.filter(l => isToday(l.retirada_em)).reduce((s, l) => s + Number(l.valor || 0), 0);
    return {
      entradas: ent.length,
      aguardando: ag.length,
      lavando: lv.length,
      concluidas: co.length,
      ocorrencias: oc.length,
      retirados: rt.length,
      faturamentoPrevisto,
      dinheiroRecebido
    };
  }, [state.lavagens]);

  const ativas = state.lavagens.filter(l => l.ativa).sort((a,b) => new Date(b.entrada_em) - new Date(a.entrada_em));
  const proximas = ativas.slice(0, 5);

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="muted" style={{ fontSize: 13, fontWeight: 500 }}>
            Bom dia, Marquinhos ☀️
          </div>
          <div className="page-title">Como tá o dia hoje?</div>
        </div>
        <div className="actions">
          <Button icon="play" kind="primary" onClick={() => dispatch({ type: 'TOGGLE_SIMULATION' })}>
            {state.simulating ? "Pausar simulação" : "Simular tempo"}
          </Button>
          <Button icon="plus" kind="default" onClick={() => dispatch({ type: 'NAVIGATE', route: 'nova-lavagem' })}>
            Nova lavagem
          </Button>
        </div>
      </div>

      {state.simulating && (
        <div className="sim-banner mt-2" style={{ marginBottom: 14 }}>
          <Icon name="clock" size={16} /> Simulando o tempo passando — os status avançam sozinhos a cada poucos segundos.
        </div>
      )}

      <div className="stats-grid mt-2">
        <Stat label="Entradas hoje" value={stats.entradas} icon="car" accent="default" />
        <Stat label="Aguardando" value={stats.aguardando} icon="clock" accent="yellow" />
        <Stat label="Lavando agora" value={stats.lavando} icon="droplet" accent="sky" />
        <Stat label="Concluídas" value={stats.concluidas} icon="check" accent="mint" />
      </div>

      <div className="stats-grid mt-4">
        <Stat label="Retirados" value={stats.retirados} icon="key" accent="default" />
        <Stat label="Ocorrências abertas" value={stats.ocorrencias} icon="alert" accent="rose" />
        <Stat label="Faturamento previsto" value={moneyBR(stats.faturamentoPrevisto)} icon="tag" accent="default" big />
        <Stat label="Dinheiro recebido" value={moneyBR(stats.dinheiroRecebido)} icon="money" accent="money" big />
      </div>

      <div className="mt-6" style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr' }}>
        <div className="card flush">
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: 16 }}>Lavagens ativas agora</h3>
              <div className="muted" style={{ fontSize: 12 }}>As {Math.min(5, ativas.length)} mais recentes</div>
            </div>
            <a className="btn ghost sm" href="#/gestor/lavagens" onClick={(e) => { e.preventDefault(); dispatch({ type: 'NAVIGATE', route: 'lavagens' }); }}>
              Ver tudo <Icon name="fwd" size={14} />
            </a>
          </div>
          <div style={{ padding: 14 }} className="row-list">
            {proximas.length === 0 && (
              <div className="muted" style={{ padding: 18, textAlign: 'center' }}>
                Sem lavagens ativas agora. Bora puxar a primeira do dia! 🧽
              </div>
            )}
            {proximas.map(l => {
              const c = state.clientes.find(c => c.id === l.cliente_id);
              const v = state.veiculos.find(v => v.id === l.veiculo_id);
              const s = state.servicos.find(s => s.id === l.servico_id);
              return (
                <div className="row-item" key={l.id} onClick={() => dispatch({ type: 'VIEW_LAVAGEM', id: l.id })}>
                  <span className="plate">{v?.placa}</span>
                  <div className="grow">
                    <div className="title">{c?.nome}</div>
                    <div className="sub">{s?.nome} · {v?.modelo}</div>
                  </div>
                  <StatusBadge status={l.status_atual} size="sm" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const Stat = ({ label, value, icon, accent = "default", big }) => (
  <div className={`stat accent-${accent}`}>
    <div className="icon-bg"><Icon name={icon} size={20} /></div>
    <div className="label">{label}</div>
    <div className="value" style={big ? { fontSize: 28 } : null}>{value}</div>
  </div>
);

window.DashboardScreen = DashboardScreen;
