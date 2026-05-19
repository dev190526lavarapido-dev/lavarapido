/* ============================================================
   Modal WhatsApp — preview da mensagem + abrir wa.me
   ============================================================ */
const WhatsAppModal = ({ lavagemId, tipo, onClose }) => {
  const { state, dispatch } = window.useApp();
  const l = state.lavagens.find(x => x.id === lavagemId);
  if (!l) return null;
  const cliente = state.clientes.find(c => c.id === l.cliente_id);
  const veiculo = state.veiculos.find(v => v.id === l.veiculo_id);
  const servico = state.servicos.find(s => s.id === l.servico_id);
  const loja = state.loja;
  const link = buildPubUrl(l.token_publico);
  const initial = buildWaMessage(tipo, { cliente, veiculo, servico, loja, link, status: l.status_atual, descricao: l.ocorrencia_descricao });
  const [msg, setMsg] = React.useState(initial);
  React.useEffect(() => { setMsg(initial); }, [tipo, l.id]);

  const open = () => {
    const url = waLink(cliente?.whatsapp, msg);
    window.open(url, '_blank');
    dispatch({ type: 'LOG_WHATSAPP', lavagem_id: l.id, tipo, mensagem: msg, link });
    onClose();
  };

  const presets = ['entrada', 'lavando', 'concluida', 'aguardando', 'ocorrencia', 'retirado', 'manual'];

  // rótulos curtos para os chips de preset
  const presetChip = (p) => ({
    entrada: 'Entrada', lavando: 'Lavando', concluida: 'Pronto',
    aguardando: 'Fila', ocorrencia: 'Ocorrência', retirado: 'Retirado', manual: 'Outro'
  })[p] || p;

  return (
    <Modal title={tituloPorTipo(tipo)} onClose={onClose}
      footer={<><Button kind="ghost" onClick={onClose}>Pular aviso</Button><div className="spacer" /><Button kind="whats" icon="whats" onClick={open}>Abrir no WhatsApp</Button></>}
    >
      <div className="row" style={{ gap: 10, alignItems: 'center', marginBottom: 12 }}>
        <div className={`avatar avatar-color-0`} style={{ width: 36, height: 36, borderRadius: 12, display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, background: 'var(--bg-2)' }}>
          {initials(cliente?.nome || '')}
        </div>
        <div className="grow">
          <div style={{ fontWeight: 600, fontSize: 14 }}>{cliente?.nome}</div>
          <div className="muted mono" style={{ fontSize: 12 }}>{cliente?.whatsapp}</div>
        </div>
      </div>

      <div className="row wrap" style={{ gap: 6, marginBottom: 10 }}>
        {presets.map(p => (
          <button
            key={p}
            className={`btn sm ${p === tipo ? 'primary' : ''}`}
            onClick={() => {
              const m = buildWaMessage(p, { cliente, veiculo, servico, loja, link, status: l.status_atual, descricao: l.ocorrencia_descricao });
              setMsg(m);
            }}
          >{presetChip(p)}</button>
        ))}
      </div>

      <div className="wa-chat">
        <div className="wa-bubble">
          {msg}
          <span className="time">{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      <div className="mt-4 field">
        <label>Editar mensagem</label>
        <textarea className="textarea" value={msg} onChange={(e) => setMsg(e.target.value)} rows={6} />
      </div>

      <div className="hint mt-2">
        Lembrando: <strong>wa.me</strong> abre o WhatsApp com a mensagem pronta — você precisa clicar em enviar lá.
      </div>
    </Modal>
  );
};

window.WhatsAppModal = WhatsAppModal;
