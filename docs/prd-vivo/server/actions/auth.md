# auth.ts

"use server"

## login

RECEBE: formData (objeto: email string, password string)

autenticar com email/senha no Supabase Auth
SE erro → retorna { error: mensagem }
redireciona para /gestor/dashboard

## logout

encerra sessão no Supabase Auth
redireciona para /login
