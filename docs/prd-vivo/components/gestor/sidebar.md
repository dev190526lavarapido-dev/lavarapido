# sidebar

## Sidebar

CONSTANTE NAV_ITEMS = itens de navegacao:
  - Dashboard     → /gestor/dashboard     (icone LayoutDashboard)
  - Lavagens      → /gestor/lavagens      (icone Columns3)
  - Clientes      → /gestor/clientes      (icone Users)
  - Catalogo      → /gestor/catalogo      (icone Tag)
  - Configuracoes → /gestor/configuracoes (icone Settings)

RECEBE: (sem props)
ESTADO: pathname = usePathname()

PARA cada item em NAV_ITEMS FACA
  isActive = pathname == item.href OU começa com item.href + "/"
  SE isActive → fundo surface, sombra, texto ink
  SENAO → texto ink-2, hover fundo bg-2

RENDERIZA
  nav visivel apenas em telas >= 900px (hidden por padrao, min-[900px]:flex)
  label secao "Operacao" (mono, maiusculo)
  CTA "Nova lavagem" → /gestor/nova-lavagem (fundo brand, icone Plus)
  PARA cada item → link com icone + label, estilo ativo/inativo
