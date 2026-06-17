# Estado Atual — lavarapido

## ⚠️ BLOQUEIO DE AMBIENTE (2026-06-16)
O projeto Supabase **DEV configurado no repo (`xvwfnldvbxequhabunqi`) não existe mais** —
o host `xvwfnldvbxequhabunqi.supabase.co` retorna **NXDOMAIN** (não é pausa, é inexistente).
Além disso, a CLI do Supabase está logada numa conta/org (`orlwnechxfslpfgbsmha`) que só tem
os projetos "Fonte rotas DEV" e "fonterotas" — nenhum é o DEV/PROD do lavarapido.
PROD (`jlcjguchifzvhkczveie`) ainda resolve normalmente.

**Impacto**: não é possível aplicar/validar migrations nem rodar E2E em DEV até isso ser
resolvido (recriar o DEV com novo ref + atualizar `.env.local`/`config`/`CLAUDE.md`/memória,
ou logar a conta correta). Ver `docs/iteracoes/2026-06-16_fechamento-diario/EXECUCAO.md`.

## Ciclo ativo
Iteração `2026-06-16_fechamento-diario` — **código pronto e verde (tsc/build/lint + sentinela),
porém banco bloqueado** (ver acima). 3 migrations escritas, **não aplicadas**.

### O que foi feito
- Tabela `fechamentos_diarios` (snapshot por `user_id`+`data`) + RLS (só SELECT do dono).
- Funções `fechar_dia(date,uuid)` / `fechar_dia(date)` (cron) / `fechar_dia_atual()` (RPC manual).
- Job `pg_cron` `fechar-dia-diario` (03:00 UTC = 00:00 Brasília) consolida o dia anterior.
- Correção do fuso do dashboard: "hoje" agora é 00:00 **Brasília** (antes era 00:00 UTC).
- Aba `/gestor/fechamentos` (extrato clicável) + `/gestor/fechamentos/[data]` (resumo + lavagens).
- Botão manual "Fechar dia de hoje".

### Pendências da iteração (gated no DEV voltar)
- Aplicar as 3 migrations em DEV (`supabase db push`) e validar (extensão pg_cron, job, `fechar_dia`).
- Escrever + rodar spec E2E (fechar → ver no histórico → abrir extrato).

---

## Em produção
- **Último commit em main**: `ad2a3ac` (feat: tema esmeralda, paletas, logo upload, edicao clientes, deploy prep)
- **Migrations em PROD**: 12 (até `20260520150000_create_storage_bucket_loja.sql`)
- **URL**: Deploy automático via Vercel a partir da branch `main`

## Ciclo ativo
Iteração `2026-06-02_hardening-pos-analise` — **concluída em DEV**, aguardando promoção para `main`.

### O que foi feito nesta iteração
| Achado | Descrição | Status |
|--------|-----------|--------|
| #1 — RLS acompanhamento público | Policies `using(true)` em `lavagens` e `eventos_lavagem` vazavam todas as linhas via anon key. Substituídas por RPC `get_lavagem_publica` com `SECURITY DEFINER`. | Aplicado em DEV (migration pendente em PROD) |
| #2 — Cliente órfão | `criarClienteComVeiculo` criava cliente mesmo quando veículo falhava. Corrigido com transação atômica. | Mergeado |
| #3 — Race de status | `mudarStatus` sobrescrevia status concorrente. Corrigido com compare-and-swap. | Mergeado |
| #4 — EventoStatus tipado | Tipo `EventoStatus` formalizado; marco `'entrada'` incluído na timeline. | Mergeado |
| #5 — uploadLogo | Validação de MIME type e tamanho no servidor; path fixo por loja. | Mergeado |
| #6 — Script prod-setup | Script idempotente; hardening de segurança aplicado. | Mergeado |
| #7 — setState em useEffect | Eliminado padrão proibido no whatsapp-modal. | Mergeado |
| #8 — Performance queries | Contagens e somas movidas para o banco (agregação SQL). | Mergeado |
| #9 — Docs | Placeholders e links quebrados nos docs de projeto corrigidos. | Este commit |

### Migration pendente de aplicação manual no DEV
```
supabase/migrations/20260603010243_harden_acompanhamento_publico.sql
```
Aplicar com:
```bash
supabase db push --linked   # ou via dashboard Supabase DEV
```

## Banco de dados (Supabase DEV)
- **Ref**: `xvwfnldvbxequhabunqi` ⚠️ host não resolve (NXDOMAIN) — ver bloqueio no topo
- **Migrations**: 16 no repositório (1 da hardening + 3 da iteração de fechamento pendentes de aplicação)
- **RLS**: habilitado em todas as tabelas
- **RPC pública**: `get_lavagem_publica(p_token text)` — única rota de acesso anônimo a dados de lavagem
- **RPC autenticada**: `fechar_dia_atual()` — gestor consolida o próprio dia (SECURITY DEFINER, deriva user de `auth.uid()`)
- **Cron**: `pg_cron` job `fechar-dia-diario` (`0 3 * * *` UTC) → `fechar_dia(ontem em Brasília)`

## Histórico de releases
| Data | Branch | Hash | Descrição |
|------|--------|------|-----------|
| 2026-05-20 | main | `ad2a3ac` | Tema esmeralda, paletas, logo upload, edição de clientes, prep deploy |
| 2026-06-02 | dev | (pendente promoção) | Hardening pós-análise (segurança, integridade, performance, polish) |
