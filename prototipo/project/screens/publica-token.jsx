/* ============================================================
   Página pública /a/{token} — cliente acompanha a lavagem
   ============================================================ */
const PublicaTokenScreen = () => {
  const { state, dispatch } = window.useApp();
  const token = state.publicToken;
  const lavagem = state.lavagens.find(l => l.token_publico === token);

  // Redireciona se token inválido / retirado / inativa
  React.useEffect(() => {
    if (!lavagem || !lavagem.ativa || lavagem.status_atual === 'retirado') {
      // pequena espera pra cliente "perceber"
      const t = setTimeout(() => {
        dispatch({ type: 'NAVIGATE_PUBLIC_LOJA', params: { encerrada: !!lavagem } });
      }, 1400);
      return () => clearTimeout(t);
    }
  }, [lavagem?.id, lavagem?.ativa, lavagem?.status_atual]);

  if (!lavagem || !lavagem.ativa) {
    return (
      <div className="track-shell" style={{ display: 'grid', placeItems: 'center', textAlign: 'center', padding: 24 }}>
        <div>
          <Icon name="info" size={32} />
          <h2 className="mt-2">Lavagem encerrada</h2>
          <p className="muted mt-2">Te mandando pra página da loja...</p>
        </div>
      </div>
    );
  }

  const cliente = state.clientes.find(c => c.id === lavagem.cliente_id);
  const veiculo = state.veiculos.find(v => v.id === lavagem.veiculo_id);
  const servico = state.servicos.find(s => s.id === lavagem.servico_id);
  const loja = state.loja;

  const meta = STATUS_META[lavagem.status_atual];

  const whatsHref = waLink(loja.whatsapp, `Oi! Sou o(a) ${cliente?.nome}, queria falar sobre meu carro ${veiculo?.placa}.`);
  const telHref = `tel:${onlyDigits(loja.telefone)}`;

  const eventos = [...lavagem.eventos].sort((a,b) => new Date(a.t) - new Date(b.t));

  return (
    <div className="track-shell">
      <div className="track-head">
        <image-slot id="loja-logo" shape="rounded" radius="12" style={{ width: 44, height: 44, display: 'block' }} placeholder="logo"></image-slot>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>{loja.nome_loja}</div>
          <div className="muted" style={{ fontSize: 11 }}>Acompanhamento ao vivo</div>
        </div>
      </div>

      <div className="track-hero">
        <div>
          <div className="saudacao">Fala, {(cliente?.nome || '').split(' ')[0]}!</div>
          <div className="ola">A gente tá cuidando do seu carro 🚗</div>
        </div>

        <div className="vehicle-row">
          <span className="plate big">{veiculo?.placa}</span>
          <div>
            <div style={{ fontWeight: 600 }}>{veiculo?.modelo}</div>
            <div className="muted" style={{ fontSize: 12 }}>{veiculo?.cor}</div>
          </div>
        </div>

        <div>
          <span className="servico-tag"><Icon name="droplet" size={12} /> {servico?.nome} · {moneyBR(lavagem.valor)}</span>
        </div>

        <div className="status-now">
          <div className="icon-wrap">
            <span className="pulse" />
            <Icon name={meta.icon} size={32} />
          </div>
          <div className="grow">
            <div className="label">Status agora</div>
            <div className="nome">{meta.label}</div>
            {lavagem.status_atual === 'ocorrencia' && lavagem.ocorrencia_descricao && (
              <div style={{ fontSize: 13, marginTop: 6, opacity: 0.92 }}>{lavagem.ocorrencia_descricao}</div>
            )}
          </div>
        </div>
      </div>

      <div className="track-section">
        <h3>Linha do tempo</h3>
        <Timeline eventos={eventos} animateLast />
      </div>

      <div className="track-section">
        <h3>Precisa falar com a gente?</h3>
        <div className="pub-cta-row">
          <a href={whatsHref} target="_blank" rel="noreferrer" className="pub-cta whats">
            <Icon name="whats" size={22} /> WhatsApp
          </a>
          <a href={telHref} className="pub-cta">
            <Icon name="phone" size={22} /> Ligar
          </a>
          <a href={loja.maps_url} target="_blank" rel="noreferrer" className="pub-cta">
            <Icon name="pin" size={22} /> Como chegar
          </a>
        </div>
      </div>

      <div className="pub-foot">
        Link único e temporário · expira quando a lavagem é finalizada
      </div>
    </div>
  );
};

window.PublicaTokenScreen = PublicaTokenScreen;
