/* ============================================================
   Modal de detalhe de uma lavagem — gestor
   Ações: avançar / voltar status, marcar ocorrência, retirar, WhatsApp,
   copiar link público, ver linha do tempo completa.
   ============================================================ */
const LavagemDetalhe = ({ lavagemId, onClose }) => {
  const { state, dispatch } = window.useApp();
  const l = state.lavagens.find(x => x.id === lavagemId);
  if (!l) return null;

  const c = state.clientes.find(x => x.id === l.cliente_id);
  const v = state.veiculos.find(x => x.id === l.veiculo_id);
  const s = state.servicos.find(x => x.id === l.servico_id);
  const loja = state.loja;
  const pubUrl = buildPubUrl(l.token_publico);

  const eventos = [...l.eventos].sort((a,b) => new Date(a.t) - new Date(b.t));

  const change = (status) => dispatch({ type: 'CHANGE_STATUS', id: l.id, status });
  const openWhats = (tipo) => dispatch({ type: 'OPEN_WHATSAPP', id: l.id, tipo });
  const openOcorrencia = () => dispatch({ type: 'OPEN_OCORRENCIA', id: l.id });

  const [copied, setCopied] = React.useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(pubUrl).catch(() => {});
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  // ações por status
  const ActionsByStatus = () => {
    if (l.status_atual === 'retirado') return <div className="muted">Lavagem encerrada · {formatHM(l.retirada_em)}</div>;
    const items = [];
    if (l.status_atual === 'aguardando_lavagem') {
      items.push(<Button kind="primary" icon="droplet" onClick={() => change('lavando')}>Iniciar lavagem</Button>);
      items.push(<Button icon="alert" onClick={openOcorrencia}>Marcar ocorrência</Button>);
    }
    if (l.status_atual === 'lavando') {
      items.push(<Button kind="success" icon="check" onClick={() => change('lavagem_concluida')}>Concluir lavagem</Button>);
      items.push(<Button icon="back" onClick={() => change('aguardando_lavagem')}>Voltar pra aguardando</Button>);
      items.push(<Button icon="alert" onClick={openOcorrencia}>Marcar ocorrência</Button>);
    }
    if (l.status_atual === 'lavagem_concluida') {
      items.push(<Button kind="primary" icon="key" onClick={() => change('retirado')}>Marcar como retirado</Button>);
      items.push(<Button icon="back" onClick={() => change('lavando')}>Voltar pra lavando</Button>);
      items.push(<Button icon="alert" onClick={openOcorrencia}>Marcar ocorrência</Button>);
    }
    if (l.status_atual === 'ocorrencia') {
      items.push(<Button kind="primary" icon="droplet" onClick={() => change('lavando')}>Retomar lavagem</Button>);
      items.push(<Button icon="back" onClick={() => change('aguardando_lavagem')}>Voltar pra aguardando</Button>);
      items.push(<Button icon="edit" onClick={openOcorrencia}>Editar ocorrência</Button>);
    }
    return <div className="row wrap" style={{ gap: 8 }}>{items.map((b, i) => React.cloneElement(b, { key: i }))}</div>;
  };

  return (
    <Modal title={`Lavagem · ${v?.placa}`} onClose={onClose}>
      <div className="row between" style={{ marginBottom: 10 }}>
        <StatusBadge status={l.status_atual} />
        <div className="muted mono" style={{ fontSize: 12 }}>Entrada {formatHM(l.entrada_em)}</div>
      </div>

      <div className="row" style={{ gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <span className="plate big">{v?.placa}</span>
        <div className="grow">
          <div style={{ fontWeight: 700 }}>{c?.nome}</div>
          <div className="muted mono" style={{ fontSize: 12 }}>{c?.whatsapp}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="muted" style={{ fontSize: 12 }}>{v?.modelo} · {v?.cor}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22 }}>{moneyBR(l.valor)}</div>
        </div>
      </div>
      <div className="muted mt-2" style={{ fontSize: 13 }}>{s?.nome} — {s?.descricao}</div>
      {l.observacao && <div className="mt-2" style={{ fontSize: 13, background: 'var(--bg-2)', padding: '8px 12px', borderRadius: 10 }}>📝 {l.observacao}</div>}
      {l.status_atual === 'ocorrencia' && l.ocorrencia_descricao && (
        <div className="mt-2" style={{ fontSize: 13, background: 'color-mix(in oklab, var(--rose) 10%, transparent)', padding: '10px 12px', borderRadius: 10, color: 'var(--rose)', fontWeight: 500 }}>
          ⚠ {l.ocorrencia_descricao}
        </div>
      )}

      <div className="mt-4">
        <h3 style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.06em' }}>Ações</h3>
        <ActionsByStatus />
        <div className="row mt-4" style={{ gap: 8, flexWrap: 'wrap' }}>
          <Button kind="whats" icon="whats" onClick={() => openWhats('manual')}>Avisar cliente no WhatsApp</Button>
          <Button icon="copy" onClick={copy}>{copied ? 'Link copiado!' : 'Copiar link do cliente'}</Button>
          <a href={pubUrl} target="_blank" rel="noreferrer" className="btn"><Icon name="external" size={16} /> Abrir como cliente</a>
        </div>
      </div>

      <div className="mt-6">
        <h3 style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.06em' }}>Linha do tempo</h3>
        <Timeline eventos={eventos} />
      </div>
    </Modal>
  );
};

/* ============================================================
   Modal de ocorrência — descrição livre
   ============================================================ */
const OcorrenciaModal = ({ lavagemId, onClose }) => {
  const { state, dispatch } = window.useApp();
  const l = state.lavagens.find(x => x.id === lavagemId);
  const [desc, setDesc] = React.useState(l?.ocorrencia_descricao || '');
  if (!l) return null;

  const sugestoes = [
    "Cliente esqueceu a chave",
    "Carro precisa de produto especial",
    "Cliente precisa confirmar serviço extra",
    "Serviço pausado por problema interno"
  ];

  const salvar = () => {
    if (!desc.trim()) return;
    dispatch({ type: 'SET_OCORRENCIA', id: l.id, descricao: desc });
    onClose();
  };

  return (
    <Modal title="Marcar ocorrência" onClose={onClose}
      footer={<><Button kind="ghost" onClick={onClose}>Cancelar</Button><div className="spacer" /><Button kind="danger" icon="alert" disabled={!desc.trim()} onClick={salvar}>Registrar ocorrência</Button></>}
    >
      <div className="muted mt-2" style={{ fontSize: 13 }}>O cliente vai ver essa descrição na página de acompanhamento.</div>
      <textarea className="textarea mt-2" autoFocus value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="O que aconteceu?" />
      <div className="row wrap mt-2" style={{ gap: 6 }}>
        {sugestoes.map(s => (
          <button key={s} className="btn sm" onClick={() => setDesc(s)}>{s}</button>
        ))}
      </div>
    </Modal>
  );
};

window.LavagemDetalhe = LavagemDetalhe;
window.OcorrenciaModal = OcorrenciaModal;
