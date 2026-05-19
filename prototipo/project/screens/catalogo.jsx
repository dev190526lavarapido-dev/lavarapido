/* ============================================================
   Catálogo — serviços
   ============================================================ */
const CatalogoScreen = () => {
  const { state, dispatch } = window.useApp();
  const [editing, setEditing] = React.useState(null); // servico ou 'new'

  const sorted = [...state.servicos].sort((a,b) => a.ordem_exibicao - b.ordem_exibicao);

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">Catálogo</div>
          <div className="page-sub">Os serviços que aparecem na vitrine pública e em Nova Lavagem.</div>
        </div>
        <div className="actions">
          <Button icon="plus" kind="primary" onClick={() => setEditing('new')}>Novo serviço</Button>
        </div>
      </div>

      <div className="stack gap-2 mt-2">
        {sorted.map(s => (
          <div key={s.id} className="card row" style={{ padding: 14, gap: 14, alignItems: 'center', opacity: s.ativo ? 1 : 0.6 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bg-2)', display: 'grid', placeItems: 'center', color: 'var(--brand)', flex: 'none' }}>
              <Icon name="droplet" size={20} />
            </div>
            <div className="grow">
              <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600 }}>{s.nome}</span>
                {!s.ativo && <span className="badge retirado">Inativo</span>}
                {s.tempo_estimado_minutos && <span className="muted" style={{ fontSize: 12 }}>· ~{s.tempo_estimado_minutos} min</span>}
              </div>
              <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>{s.descricao}</div>
            </div>
            <div className="row" style={{ gap: 10 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20 }}>{moneyBR(s.valor)}</div>
              <div className={`toggle ${s.ativo ? 'on' : ''}`} onClick={() => dispatch({ type: 'TOGGLE_SERVICO', id: s.id })} title={s.ativo ? "Desativar" : "Ativar"} />
              <Button kind="ghost" size="sm" icon="edit" onClick={() => setEditing(s)} />
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <ServicoModal
          servico={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSave={(payload) => {
            if (editing === 'new') {
              dispatch({ type: 'ADD_SERVICO', servico: { ...payload, id: "s_" + Date.now() } });
            } else {
              dispatch({ type: 'UPDATE_SERVICO', id: editing.id, patch: payload });
            }
            setEditing(null);
          }}
        />
      )}
    </div>
  );
};

const ServicoModal = ({ servico, onClose, onSave }) => {
  const [v, setV] = React.useState({
    nome: servico?.nome || '',
    descricao: servico?.descricao || '',
    valor: servico?.valor || '',
    tempo_estimado_minutos: servico?.tempo_estimado_minutos || '',
    ativo: servico ? servico.ativo : true,
    ordem_exibicao: servico?.ordem_exibicao || 99
  });
  const ok = v.nome.trim() && v.valor > 0;
  return (
    <Modal title={servico ? 'Editar serviço' : 'Novo serviço'} onClose={onClose}
      footer={<><Button kind="ghost" onClick={onClose}>Cancelar</Button><div className="spacer" /><Button kind="primary" disabled={!ok} onClick={() => onSave({ ...v, valor: Number(v.valor), tempo_estimado_minutos: Number(v.tempo_estimado_minutos) || null })}>Salvar</Button></>}
    >
      <div className="stack gap-3">
        <div className="field"><label>Nome</label><input className="input" value={v.nome} onChange={(e) => setV({...v, nome: e.target.value})} autoFocus placeholder="Ex: Lavagem com cera" /></div>
        <div className="field"><label>Descrição</label><textarea className="textarea" value={v.descricao} onChange={(e) => setV({...v, descricao: e.target.value})} placeholder="Pra ajudar o cliente a entender..." /></div>
        <div className="row" style={{ gap: 10 }}>
          <div className="field" style={{ flex: 1 }}><label>Valor (R$)</label><input className="input mono" type="number" value={v.valor} onChange={(e) => setV({...v, valor: e.target.value})} placeholder="45" /></div>
          <div className="field" style={{ flex: 1 }}><label>Tempo estimado (min)</label><input className="input mono" type="number" value={v.tempo_estimado_minutos} onChange={(e) => setV({...v, tempo_estimado_minutos: e.target.value})} placeholder="60" /></div>
        </div>
        <div className="row between">
          <label className="muted" style={{ fontSize: 13 }}>Ativo (aparece na vitrine)</label>
          <div className={`toggle ${v.ativo ? 'on' : ''}`} onClick={() => setV({...v, ativo: !v.ativo})} />
        </div>
      </div>
    </Modal>
  );
};

window.CatalogoScreen = CatalogoScreen;
