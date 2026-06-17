# Execução: Fechamento diário + consolidado por dia

> Iteração: `2026-06-16_fechamento-diario`
> Plano: [PLANO.md](PLANO.md) · PRD: [PRD.md](PRD.md)

Log corrente — atualizado a cada Slice concluído.

---

## 2026-06-16 — Iteração criada

PRD capturado e plano montado. Aguardando aprovação do usuário pra iniciar a Fase 1.

## 2026-06-16 — Fase 1: migrations escritas (Slices 1.1 e 1.2 OK), Slice 1.3 🔴 BLOQUEADO

Branch: `passo-1-fechamento-banco` (a partir de `dev`).

Arquivos criados:
- `supabase/migrations/20260617021639_create_fechamentos_diarios.sql` — tabela + RLS (só SELECT do dono; sem policy de escrita)
- `supabase/migrations/20260617021739_create_fechar_dia_function.sql` — `fechar_dia(date,uuid)` core, `fechar_dia(date)` wrapper do cron, `fechar_dia_atual()` RPC manual + grants
- `supabase/migrations/20260617021839_schedule_fechamento_cron.sql` — extensão pg_cron + `cron.schedule('fechar-dia-diario', '0 3 * * *', ...)`

🔴 **Bloqueio ao aplicar no DEV** (`supabase db push`):
- DEV configurado `xvwfnldvbxequhabunqi` → **NXDOMAIN** (host não existe; projeto deletado/recriado).
- PROD `jlcjguchifzvhkczveie` → resolve normalmente (existe).
- CLI Supabase logada na org `orlwnechxfslpfgbsmha`, que só tem os projetos **"Fonte rotas DEV"** (`ovgdoqksuqvahqudkvjs`) e **"fonterotas"** (`nnheichtdofbuwyhcdxs`) — nenhum é o DEV/PROD do lavarapido.
- Rede OK (PROD e projetos da conta logada resolvem; `projects list` funcionou). NXDOMAIN do DEV é real.

Migrations **não aplicadas** em nenhum banco. Não improvisei apontando pra outro projeto. Aguardando o usuário corrigir o ambiente (ref correto do DEV ou login na conta certa).

## 2026-06-17 — Decisão do usuário: seguir só com o código (Fases 2-5)

Usuário optou por continuar com o código enquanto o DEV não volta. Aplicação no banco + E2E ficam pendentes.

**Fase 2 — Dashboard no fuso de Brasília** ✅
- `src/lib/datas.ts` (novo): `inicioDiaBrasiliaISO`, `dataBrasilia`, `formatarDataBR`, `diaDaSemana`.
- `src/server/queries/dashboard.ts`: troca `new Date().setHours(0,0,0,0)` (fuso do servidor/UTC) por `inicioDiaBrasiliaISO()`. Estado ao vivo (aguardando/lavando) segue sem filtro de dia.

**Fase 3 — Aba Fechamentos** ✅
- Tipos `FechamentoDiario` / `FechamentoLavagemDetalhe` em `src/lib/types.ts`.
- `src/server/queries/fechamentos.ts`: `getFechamentos()`, `getFechamento(data)`.
- `src/server/actions/fechamentos.ts`: `fecharDiaAtual()` (RPC `fechar_dia_atual` + revalidate).
- `src/app/gestor/fechamentos/page.tsx` + `src/components/gestor/fechamentos-view.tsx` (extrato + botão "Fechar dia de hoje").
- `src/app/gestor/fechamentos/[data]/page.tsx` (resumo via StatCards + lista de lavagens).
- Menu: `sidebar.tsx` ("Fechamentos") + `bottom-bar.tsx` ("Extrato", min-width ajustado p/ 6 itens).

**Fase 4 — Testes + segurança** (parcial)
- `tsc --noEmit` ✅ · `lint` ✅ · `build` ✅ (rotas `/gestor/fechamentos` e `[data]` dinâmicas ƒ).
- 🐛 **Bug encontrado na auto-revisão e corrigido**: `fechar_dia_atual()` estava `SECURITY INVOKER` mas chamava `fechar_dia(date,uuid)` sem grant pra `authenticated` → daria "permission denied". Corrigido pra `SECURITY DEFINER` (seguro: usa `auth.uid()`).
- Sentinela (revisão estática independente): **PROSSEGUIR**. Sem regressões, sem SQL injection, isolamento multi-tenant OK. 2 achados LOW informativos (incl. `handle_updated_at` sem search_path — dívida pré-existente, fora de escopo).
- 🔴 E2E: pendente (precisa do DEV vivo).

**Fase 5 — Docs** ✅
- `README.md` + `ESTADO_ATUAL.md` atualizados (rotas, tabela, cron, RPC, bloqueio de ambiente).
- `ADR.md` criado (pg_cron + fuso Brasília + snapshot imutável + escrita só via DEFINER).

### Pendências pra quando o DEV voltar
1. `supabase db push` das 3 migrations + validar (extensão pg_cron, `cron.job`, `select fechar_dia(current_date)`).
2. Escrever e rodar a spec E2E (fechar → histórico → extrato).
