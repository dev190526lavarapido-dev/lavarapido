/* ============================================================
   Login — gestor
   ============================================================ */
const LoginScreen = () => {
  const { dispatch } = window.useApp();
  const [email, setEmail] = React.useState("marquinhos@lavarapido.com");
  const [senha, setSenha] = React.useState("••••••••");

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch({ type: 'LOGIN' });
  };

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'radial-gradient(1200px 600px at 0% 0%, color-mix(in oklab, var(--yellow) 25%, transparent), transparent 60%), radial-gradient(900px 500px at 100% 100%, color-mix(in oklab, var(--brand) 20%, transparent), transparent 60%), var(--bg)',
      display: 'grid',
      placeItems: 'center',
      padding: '24px'
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{
            width: 76, height: 76, borderRadius: 22, margin: '0 auto 14px',
            background: 'var(--brand)', color: 'var(--brand-ink)',
            display: 'grid', placeItems: 'center',
            boxShadow: 'var(--shadow-lg)',
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 36
          }}>LR</div>
          <h1 style={{ fontSize: 28, marginBottom: 4 }}>Bom te ver de volta!</h1>
          <p className="muted" style={{ fontSize: 14 }}>Entra aí pra cuidar da galera de hoje.</p>
        </div>

        <form className="card" onSubmit={onSubmit} style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>Senha</label>
            <input className="input" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
          </div>
          <Button kind="primary" size="lg" block type="submit" iconRight="fwd">Entrar no painel</Button>
          <div className="muted" style={{ fontSize: 12, textAlign: 'center' }}>Esquecer senha? Fala com o suporte.</div>
        </form>

        <div style={{ marginTop: 18, textAlign: 'center' }}>
          <a href="#/" className="btn ghost sm" style={{ display: 'inline-flex' }}>
            <Icon name="store" size={16} /> Ver vitrine pública
          </a>
        </div>
      </div>
    </div>
  );
};

window.LoginScreen = LoginScreen;
