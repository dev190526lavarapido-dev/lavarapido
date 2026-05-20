# proxy.ts

## proxy (exportado tambem como middleware)

RECEBE: request (NextRequest)

FACA
  supabaseResponse = NextResponse.next(request)

  supabase = createServerClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
    cookies.getAll() ← request.cookies.getAll()
    cookies.setAll(cookiesToSet) FACA
      atualizar request.cookies com cada cookie
      recriar supabaseResponse = NextResponse.next(request)
      atualizar supabaseResponse.cookies com cada cookie

  user = supabase.auth.getUser()

  SE pathname começa com "/gestor" E user nao existe FACA
    clonar url, setar pathname="/login"
    RETORNAR NextResponse.redirect(url)

  SE pathname == "/login" E user existe FACA
    clonar url, setar pathname="/gestor/dashboard"
    RETORNAR NextResponse.redirect(url)

  RETORNAR supabaseResponse

EXPORTA config
  matcher: todas rotas exceto _next/static, _next/image, favicon.ico e arquivos svg/png/jpg/jpeg/gif/webp

EXPORTA proxy como middleware (alias legado)
