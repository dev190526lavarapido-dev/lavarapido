# bottom-bar

## BottomBar

CONSTANTE TABS = lista de abas:
  - Dashboard → /gestor/dashboard (icone LayoutDashboard)
  - Lavagens  → /gestor/lavagens  (icone Columns3)
  - Nova      → /gestor/nova-lavagem (icone Plus, cta=true)
  - Clientes  → /gestor/clientes  (icone Users)
  - Catalogo  → /gestor/catalogo  (icone Tag)

RECEBE: (sem props)
ESTADO: pathname = usePathname()

PARA cada tab em TABS FACA
  isActive = pathname == tab.href OU começa com tab.href + "/"

  SE tab.cta FACA
    renderizar link elevado com fundo brand (botao Nova Lavagem)
  SENAO
    renderizar link com cor ativa SE isActive SENAO cor muted

RENDERIZA
  nav sticky bottom, visivel apenas em telas < 900px (min-[900px]:hidden)
  para cada tab → link com icone + label
