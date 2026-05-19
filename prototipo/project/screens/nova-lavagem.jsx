/* ============================================================
   Nova Lavagem — wizard em 3 passos
   ============================================================ */
const NovaLavagemScreen = () => {
  const { state, dispatch } = window.useApp();
  const [step, setStep] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [clienteId, setClienteId] = React.useState(null);
  const [veiculoId, setVeiculoId] = React.useState(null);
  const [servicoId, setServicoId] = React.useState(null);
  const [obs, setObs] = React.useState("");
  const [criandoCliente, setCriandoCliente] = React.useState(false);
  const [novoCli, setNovoCli] = React.useState({ nome: "", whatsapp: "" });
  const [novoVei, setNovoVei] = React.useState({ placa: "", modelo: "", cor: "" });

  const cliente = state.clientes.find(c => c.id === clienteId);
  const veiculo = state.veiculos.find(v => v.id === veiculoId);
  const servico = state.servicos.find(s => s.id === servicoId);

  const clientesFiltrados = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = state.clientes.map(c => {
      const vs = state.veiculos.filter(v => v.cliente_id === c.id);
      return { ...c, veiculos: vs };
    });
    if (!q) return list.slice(0, 10);
    return list.filter(c =>
      c.nome.toLowerCase().includes(q) ||
      c.whatsapp.toLowerCase().includes(q) ||
      c.veiculos.some(v => v.placa.toLowerCase().includes(q))
    );
  }, [search, state.clientes, state.veiculos]);

  const onConfirmar = () => {
    if (!cliente || !veiculo || !servico) return;
    const lavagemId = dispatch({ type: 'ADD_LAVAGEM', cliente_id: cliente.id, veiculo_id: veiculo.id, servico_id: servico.id, valor: servico.valor, observacao: obs });
    // dispatch returns nothing; pull from state via a unique trick: we'll just navigate to lavagens and open whatsapp via id stored on last
    dispatch({ type: 'NAVIGATE', route: 'lavagens' });
    // OPEN_WHATSAPP_LAST opens the whatsapp for the newly created lavagem
    setTimeout(() => dispatch({ type: 'OPEN_WHATSAPP_LAST', tipo: 'entrada' }), 60);
  };

  const onCriarCliente = () => {
    if (!novoCli.nome.trim() || !novoCli.whatsapp.trim() || !novoVei.placa.trim()) return;
    const newClienteId = "c_new_" + Date.now();
    const newVeiculoId = "v_new_" + Date.now();
    dispatch({ type: 'ADD_CLIENTE', cliente: { id: newClienteId, nome: novoCli.nome, whatsapp: novoCli.whatsapp } });
    dispatch({ type: 'ADD_VEICULO', veiculo: { id: newVeiculoId, cliente_id: newClienteId, placa: novoVei.placa.toUpperCase(), modelo: novoVei.modelo, cor: novoVei.cor } });
    setClienteId(newClienteId);
    setVeiculoId(newVeiculoId);
    setCriandoCliente(false);
    setStep(2);
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <a className="btn ghost sm" href="#" onClick={(e) => { e.preventDefault(); dispatch({ type: 'NAVIGATE', route: 'lavagens' }); }}>
            <Icon name="back" size={14} /> Voltar
          </a>
          <div className="page-title mt-2">Nova lavagem</div>
        </div>
      </div>

      <div className="wizard-steps">
        <Step n={1} label="Cliente & veículo" cur={step} />
        <span className="sep">—</span>
        <Step n={2} label="Serviço" cur={step} />
        <span className="sep">—</span>
        <Step n={3} label="Confirmar" cur={step} />
      </div>

      {step === 1 && (
        <div className="card stack gap-4" style={{ padding: 18 }}>
          {!criandoCliente && (
            <>
              <div className="search-pill">
                <Icon name="search" size={16} />
                <input autoFocus placeholder="Buscar por nome, WhatsApp ou placa..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="row-list">
                {clientesFiltrados.map(c => (
                  <div className="row-item" key={c.id}>
                    <div className={`avatar avatar-color-${c.id.charCodeAt(c.id.length - 1) % 5}`}>{initials(c.nome)}</div>
                    <div className="grow">
                      <div className="title">{c.nome}</div>
                      <div className="sub mono">{c.whatsapp}</div>
                      <div className="row mt-2" style={{ gap: 6, flexWrap: 'wrap' }}>
                        {c.veiculos.map(v => (
                          <button
                            key={v.id}
                            className="btn sm"
                            onClick={() => { setClienteId(c.id); setVeiculoId(v.id); setStep(2); }}
                            style={{ height: 30, padding: '0 10px' }}
                          >
                            <span className="plate" style={{ fontSize: 11, padding: '2px 6px' }}>{v.placa}</span>
                            <span style={{ fontSize: 12 }}>{v.modelo}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                {clientesFiltrados.length === 0 && (
                  <div className="muted center" style={{ padding: 18 }}>
                    Nenhum cliente encontrado. Cadastra agora ali em baixo 👇
                  </div>
                )}
              </div>
              <Button icon="plus" onClick={() => setCriandoCliente(true)}>Cadastrar cliente novo</Button>
            </>
          )}

          {criandoCliente && (
            <div className="stack gap-3">
              <h3>Novo cliente</h3>
              <div className="field"><label>Nome</label><input className="input" value={novoCli.nome} onChange={(e) => setNovoCli({...novoCli, nome: e.target.value})} placeholder="Ex: Marcelo Andrade" /></div>
              <div className="field"><label>WhatsApp</label><input className="input" value={novoCli.whatsapp} onChange={(e) => setNovoCli({...novoCli, whatsapp: e.target.value})} placeholder="+55 11 9..." /></div>
              <h3 className="mt-4">Veículo</h3>
              <div className="row" style={{ gap: 10 }}>
                <div className="field" style={{ flex: 1 }}><label>Placa</label><input className="input mono" value={novoVei.placa} onChange={(e) => setNovoVei({...novoVei, placa: e.target.value.toUpperCase()})} placeholder="ABC1D23" /></div>
                <div className="field" style={{ flex: 1 }}><label>Cor</label><input className="input" value={novoVei.cor} onChange={(e) => setNovoVei({...novoVei, cor: e.target.value})} placeholder="Prata" /></div>
              </div>
              <div className="field"><label>Modelo</label><input className="input" value={novoVei.modelo} onChange={(e) => setNovoVei({...novoVei, modelo: e.target.value})} placeholder="Honda Civic" /></div>
              <div className="row mt-2" style={{ gap: 8 }}>
                <Button kind="primary" onClick={onCriarCliente}>Salvar e seguir</Button>
                <Button kind="ghost" onClick={() => setCriandoCliente(false)}>Cancelar</Button>
              </div>
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="card stack gap-4" style={{ padding: 18 }}>
          <div className="row between">
            <div>
              <div className="muted" style={{ fontSize: 12 }}>Cliente</div>
              <div style={{ fontWeight: 600 }}>{cliente?.nome}</div>
              <div className="row mt-2" style={{ gap: 8 }}>
                <span className="plate">{veiculo?.placa}</span>
                <span className="muted" style={{ fontSize: 13 }}>{veiculo?.modelo} · {veiculo?.cor}</span>
              </div>
            </div>
            <Button kind="ghost" size="sm" onClick={() => setStep(1)}>Trocar</Button>
          </div>

          <div>
            <h3 style={{ fontSize: 16, marginBottom: 10 }}>Escolha o serviço</h3>
            <div className="stack gap-2">
              {state.servicos.filter(s => s.ativo).sort((a,b) => a.ordem_exibicao - b.ordem_exibicao).map(s => (
                <button key={s.id} className={`pub-svc`} onClick={() => setServicoId(s.id)} style={{ cursor: 'pointer', textAlign: 'left', borderColor: servicoId === s.id ? 'var(--brand)' : 'var(--line)', boxShadow: servicoId === s.id ? '0 0 0 3px color-mix(in oklab, var(--brand) 20%, transparent)' : 'none', background: 'var(--surface)' }}>
                  <div>
                    <div className="nome">{s.nome}</div>
                    <div className="desc">{s.descricao}</div>
                    {s.tempo_estimado_minutos && <div className="meta mt-2"><Icon name="clock" size={12} /> ~{s.tempo_estimado_minutos} min</div>}
                  </div>
                  <div className="preco">{moneyBR(s.valor)}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="row" style={{ gap: 8 }}>
            <Button kind="ghost" onClick={() => setStep(1)}>Voltar</Button>
            <div className="spacer" />
            <Button kind="primary" disabled={!servicoId} onClick={() => setStep(3)} iconRight="fwd">Continuar</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card stack gap-4" style={{ padding: 18 }}>
          <h3>Tudo certo, Marquinhos?</h3>
          <div className="stack gap-3">
            <RowInfo label="Cliente" value={cliente?.nome} />
            <RowInfo label="WhatsApp" value={cliente?.whatsapp} mono />
            <RowInfo label="Veículo" value={`${veiculo?.placa} · ${veiculo?.modelo} · ${veiculo?.cor}`} />
            <RowInfo label="Serviço" value={servico?.nome} />
            <RowInfo label="Valor" value={moneyBR(servico?.valor || 0)} bold />
          </div>
          <div className="field">
            <label>Observação (opcional)</label>
            <textarea className="textarea" value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Ex: cuidado com o tapete do porta-malas..." />
          </div>
          <div className="hint">
            Ao confirmar, a gente cria a lavagem, gera o link de acompanhamento e já abre o WhatsApp com a mensagem de entrada pronta pra você revisar e enviar.
          </div>
          <div className="row" style={{ gap: 8 }}>
            <Button kind="ghost" onClick={() => setStep(2)}>Voltar</Button>
            <div className="spacer" />
            <Button kind="primary" size="lg" onClick={onConfirmar} icon="check">Confirmar entrada</Button>
          </div>
        </div>
      )}
    </div>
  );
};

const Step = ({ n, label, cur }) => (
  <div className={`wizard-step ${cur === n ? 'active' : ''} ${cur > n ? 'done' : ''}`}>
    <span className="num">{cur > n ? '✓' : n}</span>
    <span>{label}</span>
  </div>
);
const RowInfo = ({ label, value, mono, bold }) => (
  <div className="row between" style={{ borderBottom: '1px dashed var(--line)', paddingBottom: 8 }}>
    <span className="muted" style={{ fontSize: 13 }}>{label}</span>
    <span style={{ fontWeight: bold ? 700 : 500, fontFamily: mono ? 'var(--font-mono)' : 'inherit', fontSize: bold ? 18 : 14 }}>{value}</span>
  </div>
);

window.NovaLavagemScreen = NovaLavagemScreen;
