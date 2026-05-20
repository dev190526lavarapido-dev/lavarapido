# topbar

## Topbar

RECEBE: (sem props)

ESTADO:
  nomeLoja = 'Lava Rapido'
  logoUrl = null (string | null)

useEffect ao montar:
  busca configuracoes_loja (nome_loja, logo_url) via supabase browser client → BD [banco_de_dados.md](../../banco_de_dados.md) → configuracoes_loja
  SE data.nome_loja → setNomeLoja(data.nome_loja)
  SE data.logo_url → setLogoUrl(data.logo_url)

RENDERIZA
  header sticky top, z-30, ocupa 2 colunas em min-[900px]
  marca:
    SE logoUrl → img 32x32 com object-cover e rounded-[10px]
    SENAO → badge brand 32x32 com primeira letra de nomeLoja
    nomeLoja (texto sempre visivel)
  spacer flex-1
  acoes:
    link "Vitrine" → / (icone Store, label "Vitrine" oculto em mobile)
    link icone Settings → /gestor/configuracoes
    form action=logout:
      botao submit icone LogOut (chama server action logout → ver [server/actions/auth.md](../../server/actions/auth.md))
