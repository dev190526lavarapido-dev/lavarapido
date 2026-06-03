# Migrations a aplicar em PROD — Release 1

PROD (`jlcjguchifzvhkczveie`) já tem o schema (release incremental). Aplicar **apenas** a migration nova.

## Lista

| # | Arquivo | Resumo |
|---|---------|--------|
| 1 | `20260603010243_harden_acompanhamento_publico.sql` | RPC `get_lavagem_publica` + remove 2 policies `using(true)` + token forte. Idempotente. |

## Plano de aplicação (manual, pelo usuário)

> O usuário aplica via **SQL Editor do Supabase PROD** (o CLI está logado em outra conta Supabase, então `db push` não serve para este PROD).

Ordem: **aplicar a migration ANTES do merge dev→main** (fecha o vazamento imediatamente; aceita-se a janela curta de `/a/[token]` indisponível até o deploy do novo código).

1. Abrir SQL Editor do projeto PROD (`jlcjguchifzvhkczveie`).
2. Colar e rodar o conteúdo de `supabase/migrations/20260603010243_harden_acompanhamento_publico.sql`.
3. Confirmar: a função `get_lavagem_publica` existe e as policies `"Publico pode ver lavagem por token"` / `"Publico pode ver eventos de lavagem"` não existem mais.

## Rollback (se necessário)

A migration é idempotente; em emergência, para restaurar o comportamento antigo (NÃO recomendado — reabre o vazamento):

```sql
-- Reverter (reabre o acesso público — só em emergência):
drop function if exists public.get_lavagem_publica(text);
create policy "Publico pode ver lavagem por token" on public.lavagens for select using (true);
create policy "Publico pode ver eventos de lavagem" on public.eventos_lavagem for select using (true);
```

Preferível, em caso de problema, é **reverter o deploy** (Vercel) para o código antigo e manter a migration aplicada — mas aí o código antigo (query direta) não lê mais `lavagens`. Por isso o melhor caminho de recuperação é **avançar** (garantir o deploy do novo código), não reverter.
