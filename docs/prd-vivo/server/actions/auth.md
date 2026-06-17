# auth.ts

## login

RECEBE: formData (objeto: email string, password string)

TENTAR
  autenticar com email/senha no Supabase Auth
  SE erro → retorna { error: mensagem }
  redireciona para /gestor/dashboard
SE FALHAR
  retorna { error: mensagem }

## logout

TENTAR
  encerra sessão no Supabase Auth
  redireciona para /login
SE FALHAR
  (sem retorno explícito)
