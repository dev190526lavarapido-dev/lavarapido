# Estado Atual — lavarapido

## Ciclo ativo
Iteração `2026-06-16_fechamento-diario` — **concluída em DEV** (código + migrations + E2E verdes),
aguardando promoção para `main`.

> Nota de ambiente: em 2026-06-16 o projeto DEV (`xvwfnldvbxequhabunqi`) apareceu fora do ar
> (NXDOMAIN, projeto pausado). Em 2026-06-17 voltou a resolver e as migrations foram aplicadas
> normalmente — nenhum dado foi perdido (era pausa/migrations pendentes, não recriação).

### O que foi feito
- Tabela `fechamentos_diarios` (snapshot por `user_id`+`data`) + RLS (só SELECT do dono).
- Funções `fechar_dia(date,uuid)` / `fechar_dia(date)` (cron) / `fechar_dia_atual()` (RPC manual).
- Job `pg_cron` `fechar-dia-diario` (03:00 UTC = 00:00 Brasília) consolida o dia anterior.
- Correção do fuso do dashboard: "hoje" agora é 00:00 **Brasília** (antes era 00:00 UTC).
- Aba `/gestor/fechamentos` (extrato clicável) + `/gestor/fechamentos/[data]` (resumo + lavagens).
- Botão manual "Fechar dia de hoje".
- 🔒 **Fix de segurança** (migration `20260617134219`): `revoke from public` não basta no Supabase
  (default privileges concedem EXECUTE a `anon`/`authenticated` direto). Revogado explicitamente
  de `anon`/`authenticated` nas funções internas — anon não chama mais nenhuma `fechar_dia*`.

### Validação (DEV)
- `tsc` / `build` / `lint` verdes · sentinela: PROSSEGUIR.
- Migrations aplicadas e confirmadas (`supabase migration list`); pg_cron habilitado e job agendado.
- Smoke autenticado: `fechar_dia_atual()` grava e RLS isola por dono.
- Anon bloqueado (`42501 permission denied`) em `fechar_dia_atual`/`fechar_dia` após o fix.
- E2E: suite completa **15/15 verde** (~2.8 min), incl. `fechamentos.spec.ts`.

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
- **Ref**: `xvwfnldvbxequhabunqi`
- **Migrations**: 17 no repositório, **todas aplicadas em DEV** (inclui hardening + fechamento + fix de grants)
- **RLS**: habilitado em todas as tabelas
- **RPC pública**: `get_lavagem_publica(p_token text)` — única rota de acesso anônimo a dados de lavagem
- **RPC autenticada**: `fechar_dia_atual()` — gestor consolida o próprio dia (SECURITY DEFINER, deriva user de `auth.uid()`)
- **Cron**: `pg_cron` job `fechar-dia-diario` (`0 3 * * *` UTC) → `fechar_dia(ontem em Brasília)`

## Histórico de releases
| Data | Branch | Hash | Descrição |
|------|--------|------|-----------|
| 2026-05-20 | main | `ad2a3ac` | Tema esmeralda, paletas, logo upload, edição de clientes, prep deploy |
| 2026-06-02 | dev | (pendente promoção) | Hardening pós-análise (segurança, integridade, performance, polish) |
