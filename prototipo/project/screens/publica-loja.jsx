/* ============================================================
   Página pública / — vitrine institucional da loja
   ============================================================ */
const PublicaLojaScreen = () => {
  const { state, dispatch } = window.useApp();
  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  const encerrada = params.get('lavagem') === 'encerrada';

  const loja = state.loja;
  const servicos = state.servicos.filter(s => s.ativo).sort((a,b) => a.ordem_exibicao - b.ordem_exibicao);

  const whatsHref = waLink(loja.whatsapp, loja.mensagem_whatsapp_padrao || '');
  const telHref = `tel:${onlyDigits(loja.telefone)}`;

  return (
    <div className="pub-shell">
      <div className="pub-header row between">
        <div className="row" style={{ gap: 12 }}>
          <image-slot id="loja-logo" shape="rounded" radius="14" style={{ width: 56, height: 56, display: 'block' }} placeholder="logo"></image-slot>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>{loja.nome_loja}</div>
            <div className="muted" style={{ fontSize: 12 }}>{loja.horario_funcionamento}</div>
          </div>
        </div>
        <a className="btn ghost sm hide-mobile" href="#/gestor/dashboard" onClick={(e) => { e.preventDefault(); dispatch({ type: 'NAVIGATE', route: 'dashboard' }); }}>
          <Icon name="key" size={14} /> Sou da equipe
        </a>
      </div>

      {encerrada && (
        <div style={{ margin: '0 18px 0', padding: '12px 14px', background: 'color-mix(in oklab, var(--yellow) 25%, var(--surface))', border: '1px solid color-mix(in oklab, var(--yellow) 50%, var(--line))', borderRadius: 12, fontSize: 13 }}>
          <Icon name="info" size={14} /> Essa lavagem já foi encerrada. Olha embaixo os serviços que a gente tem disponível ;)
        </div>
      )}

      <div className="pub-hero">
        <div className="nome-loja">{loja.nome_loja}</div>
        <div className="desc">{loja.descricao}</div>

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

      <div className="pub-section">
        <h2>Nossos serviços</h2>
        <div className="pub-svc-grid">
          {servicos.map(s => (
            <div className="pub-svc" key={s.id}>
              <div>
                <div className="nome">{s.nome}</div>
                <div className="desc">{s.descricao}</div>
                {s.tempo_estimado_minutos && <div className="meta mt-2"><Icon name="clock" size={12} /> ~{s.tempo_estimado_minutos} min</div>}
              </div>
              <div className="preco">{moneyBR(s.valor)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="pub-section">
        <h2>A gente fica aqui</h2>
        <div className="pub-info">
          <div className="info-card">
            <div className="icon-wrap"><Icon name="pin" size={20} /></div>
            <div>
              <div className="label">Endereço</div>
              <div className="value">{loja.endereco_texto}</div>
            </div>
          </div>
          <div className="info-card">
            <div className="icon-wrap"><Icon name="clock" size={20} /></div>
            <div>
              <div className="label">Horário</div>
              <div className="value">{loja.horario_funcionamento}</div>
            </div>
          </div>
          <div className="info-card">
            <div className="icon-wrap"><Icon name="phone" size={20} /></div>
            <div>
              <div className="label">Telefone</div>
              <div className="value mono">{loja.telefone}</div>
            </div>
          </div>
          {loja.instagram_url && (
            <div className="info-card">
              <div className="icon-wrap"><Icon name="instagram" size={20} /></div>
              <div>
                <div className="label">Instagram</div>
                <div className="value">{loja.instagram_url}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pub-foot">
        Feito com 💧 e muita espuma · {loja.nome_loja}
      </div>
    </div>
  );
};

window.PublicaLojaScreen = PublicaLojaScreen;
