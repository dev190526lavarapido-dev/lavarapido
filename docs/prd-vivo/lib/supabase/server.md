# supabase/server.ts

## createClient

RECEBE: (nada) — async

FACA obter cookieStore via cookies() do next/headers (await)
FACA criar cliente Supabase para uso no servidor via createServerClient
USANDO variáveis de ambiente:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
CONFIGURANDO adaptador de cookies:
  getAll(): RETORNA cookieStore.getAll()
  setAll(cookiesToSet):
    FACA iterar e definir cada { name, value, options } via cookieStore.set
    SE chamado de Server Component (sem contexto de resposta) ENTAO ignorar erro silenciosamente
      (middleware cuida do refresh de sessão)
RETORNA instância do cliente Supabase (server)
