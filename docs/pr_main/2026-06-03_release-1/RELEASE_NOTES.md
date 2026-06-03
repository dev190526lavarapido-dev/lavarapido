# Release 1 · 2026-06-03

> De `main` → `dev` (após merge) · Tipo: incremental (PROD já tem schema; Vercel já publica `main`)
> Iteração incluída: `2026-06-02_hardening-pos-analise`

## Sumário

- **Hardening de segurança**: fecha vazamento de RLS no acompanhamento público por token — leitura pública agora só via RPC `get_lavagem_publica` (SECURITY DEFINER); policies `using(true)` removidas; token de 128 bits.
- **Integridade de dados**: fim do cliente órfão (`criarClienteComVeiculo`) e da race de status (`mudarStatus` atômico).
- **Robustez**: validação de upload de logo (MIME/tamanho/path fixo), erro de lint do React Compiler eliminado, feedback de erro na UI, queries agregadas no banco (escala).
- **Qualidade**: `tsc` 0 erros · `lint` 0/0 · suite E2E **14/14 verde** · build de produção verde · sentinela consolidada **PRONTO**.

## Iterações desta release

| Iteração | Slug | Status |
|---|---|---|
| 2026-06-02 | 2026-06-02_hardening-pos-analise | 🟢 |

## PRs mergeados em dev (#23–#33)

| PR | Título |
|----|--------|
| #23 | fix(seguranca): fecha vazamento RLS do acompanhamento publico |
| #24 | fix: evita cliente órfão em criarClienteComVeiculo |
| #25 | fix: torna mudarStatus atomico via compare-and-swap |
| #26 | feat(type-safety): formaliza EventoStatus com marco 'entrada' |
| #27 | fix(prod-setup): torna script idempotente e aplica hardening |
| #28 | feat: endurece uploadLogo (MIME/tamanho + path fixo) |
| #29 | fix(lint): elimina setState em useEffect no whatsapp-modal |
| #30 | perf: agrega contagens/somas no banco |
| #31 | Slice 9.1: polish de codigo (achados BAIXO agrupados) |
| #32 | docs: corrige ESTADO_ATUAL e README |
| #33 | test(e2e): cobre acompanhamento publico anonimo + suite 14/14 |

## Migrations novas em PROD

| Arquivo | Resumo |
|---------|--------|
| `20260603010243_harden_acompanhamento_publico.sql` | RPC `get_lavagem_publica` (SECURITY DEFINER) + remove policies `using(true)` de lavagens/eventos + token default `gen_random_bytes(16)` + pgcrypto. **Idempotente.** |

## Edge functions deployadas em PROD

Nenhuma (o projeto não usa edge functions).

## Notas pro deploy

- **Migration NÃO é puramente aditiva**: remove as policies `using(true)`. O código atualmente em PROD lê `lavagens` direto (pré-RPC). Há uma janela curta (build da Vercel, ~2-3 min) em que `/a/[token]` fica indisponível (mostra "encerrada").
- **Ordem recomendada**: aplicar a migration no PROD → mergear `dev → main` → aguardar deploy. Aplicar a migration primeiro fecha o vazamento de segurança imediatamente.
- Migrations aplicadas **manualmente** pelo usuário no SQL Editor do Supabase PROD (`jlcjguchifzvhkczveie`).
- **Follow-up de segurança (não-bloqueante):** rotacionar a senha do DEV exposta em chat.
