# topbar

## Topbar

RECEBE: (sem props)

ESTADO:
  nomeLoja = 'Lava Rapido'

useEffect ao montar:
  busca configuracoes_loja.nome_loja via supabase browser client
  SE data.nome_loja → setNomeLoja(data.nome_loja)

RENDERIZA
  header sticky top, z-30, ocupa 2 colunas em min-[900px]
  marca "LR" (badge brand) + nomeLoja (oculto em mobile)
  spacer flex-1
  acoes:
    link "Vitrine" → / (icone Store, label oculto em mobile)
    link icone Settings → /gestor/configuracoes
    form action=logout:
      botao submit icone LogOut (chama server action logout)
