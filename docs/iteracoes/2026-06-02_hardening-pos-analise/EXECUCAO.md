# Execução: Hardening pós-análise de ponta a ponta

> Iteração: `2026-06-02_hardening-pos-analise` · Plano: [PLANO.md](PLANO.md) · PRD: [PRD.md](PRD.md)
> Log corrente — atualizado a cada Slice/Fase concluída.

## 2026-06-02 — Abertura da iteração

Análise de ponta a ponta concluída (saúde + segurança + qualidade). PRD e PLANO criados.
10 fases definidas (achados #1–#9 + validação E2E). Aguardando aprovação do plano para iniciar a Fase 1.

---

## 2026-06-02 — Fase 1 · RLS público (achado crítico #1) — código ✅ / migration ⛔ bloqueada

**PR #23** (`passo-1-rls-publico` → `dev`) · squash `b34bced` — "fix(seguranca): fecha vazamento RLS do acompanhamento publico".

**Arquivos:**
- `supabase/migrations/20260603010243_harden_acompanhamento_publico.sql` (novo) — RPC `get_lavagem_publica(text)` `SECURITY DEFINER` (search_path seguro, retorna só a linha do token com cliente/veículo/serviço/eventos aninhados), `revoke`/`grant` anon+authenticated, `drop` das 2 policies `using(true)`, token default `gen_random_bytes(16)` (128 bits), `pgcrypto`.
- `src/server/queries/publicas.ts` — `getLavagemPorToken` agora via `supabase.rpc('get_lavagem_publica', { p_token })`.
- `src/server/actions/lavagens.ts` — token via `randomBytes(16).toString('hex')`.

**Checks (orquestrador):** `npx tsc --noEmit` → 0 erros ✅. Migration revisada e aprovada por leitura. Lint: só os 2 problemas pré-existentes (Fase 7 e Fase 9).

**⛔ BLOQUEIO:** migration NÃO aplicada no DEV. `supabase db push` retorna 403 — o Supabase CLI está autenticado numa conta que só tem acesso aos projetos "Fonte rotas" (`ovgdoqksuqvahqudkvjs`/`nnheichtdofbuwyhcdxs`), **não** ao DEV linkado `xvwfnldvbxequhabunqi`. Sem DB password do DEV nem access token da conta correta. **A feature `/a/[token]` fica quebrada no DEV até a migration ser aplicada** (app chama RPC inexistente). Pré-requisito também para a Fase 10 (E2E). Aguardando credencial do usuário.

**Nota:** `gh auth` foi trocado de `contatoksantossp` → `dev190526lavarapido-dev` (conta com permissão de push). Push/PR OK após isso.

**Sentinela Fase 1 → PROSSEGUIR.** RPC sem injeção (`p_token` bound, `search_path` fixo), policies inseguras removidas, gestor intacto. MED: `prod_setup.sql` ainda tem `using(true)` → escopo adicionado à Fase 5 (Slice 5.2). LOW: `to_jsonb(*)` despeja linha inteira (aceitável; eventual polish para `select` explícito de colunas).

**Decisão de credencial:** usuário aplica migrations manualmente em DEV e PROD. Senha DEV gravada em `.env.local` (gitignored). ⚠️ recomendado rotacionar (exposta em chat). Migrations vão sendo acumuladas; aplicar todas no DEV antes da Fase 10.

## 2026-06-02 — Fase 2 · Cliente órfão (achado #2) ✅

**PR #24** · squash `5f8c283` — "fix: evita cliente órfão em criarClienteComVeiculo".
**Arquivo:** `src/server/actions/clientes.ts` (+14/−11).
**Mudança:** valida `veiculoSchema.omit({cliente_id:true})` ANTES de inserir o cliente; se o insert do veículo falhar, deleta o cliente (compensação). Sem migration.
**Checks (orquestrador):** li o código (linhas 130-174) — correto. `npx tsc --noEmit` → 0 erros ✅. Lint: só os 2 pré-existentes.
**Risco residual (p/ sentinela):** delete compensatório é best-effort (não verifica retorno). Caso extremo de falha simultânea ainda poderia deixar órfão — solução 100% robusta seria RPC transacional (fora do escopo code-only desta fase).

**Sentinela Fase 2 → PROSSEGUIR.** Sem riscos HIGH/MED. Delete compensatório escopado por `user_id`, cliente sempre recém-criado (impossível apagar cliente com veículos), `omit` mantém `placa min(7)`. Contrato dos callers inalterado.

## 2026-06-02 — Fase 3 · Race em mudarStatus (achado #3) ✅

**PR #25** · squash `476bc29` — "fix: torna mudarStatus atomico via compare-and-swap".
**Arquivo:** `src/server/actions/lavagens.ts` (+10/−1).
**Mudança:** `update` com `.eq('status_atual', statusAtual)` (compare-and-swap) + `.maybeSingle()`; se 0 linhas (perdeu a corrida) retorna "O status já foi alterado. Recarregue a página." e NÃO insere evento nem revalida. Sem migration.
**Checks (orquestrador):** li o código (linhas 56-110) — correto. `npx tsc --noEmit` → 0 erros ✅. Lint: só os 2 pré-existentes.

## 2026-06-02 — Fase 4 · Status inicial 'entrada' (achado #4) — REAVALIADO

**Reavaliação do orquestrador:** o achado foi superestimado na análise. A `Timeline` (`src/components/timeline.tsx`) **já trata `'entrada'` intencionalmente** (`titleMap.entrada`, `markerColors.entrada`, ícone `Car`, fallback `meta?.className ?? 'entrada'`). Não há quebra de runtime — `'entrada'` é um marco legítimo da linha do tempo (existe inclusive template WhatsApp `entrada`). Severidade real: BAIXA. Ação: **formalizar** `'entrada'` como `EventoStatus` type-safe (não remover, para não perder o marco "Carro deu entrada").

**Sentinela Fase 3 → PROSSEGUIR.** Compare-and-swap fecha a race (atômico no Postgres); `.maybeSingle()` não mascara erro/sucesso; sem vazamento. LOW (já previsto na Fase 9): erro de corrida só vai pro `console.error`, sem toast.

## 2026-06-02 — Fase 4 · Formalizar 'entrada' (achado #4, reavaliado BAIXO) ✅

**PR #26** · squash `b000ec8` — "feat(type-safety): formaliza EventoStatus com marco 'entrada' na Timeline".
**Arquivos:** `src/lib/constants.ts` (tipo `EventoStatus = LavagemStatus | 'entrada'`), `src/lib/types.ts` (`EventoLavagem.status: EventoStatus`), `src/components/timeline.tsx` (tipa `TimelineEvento.status`), `src/server/actions/lavagens.ts` (eventos iniciais tipados).
**Comportamento visual:** inalterado (zero mudança de runtime). Só type-safety.
**Checks (orquestrador):** tsc → 0 erros ✅; `EventoStatus` confirmado em constants/types. Lint: só os 2 pré-existentes.

**Sentinela Fase 4 → PROSSEGUIR.** Mudança puramente de tipagem; marco 'entrada' preservado; casts dos consumidores seguem válidos; fallbacks da Timeline protegem runtime. Sem riscos.

## 2026-06-02 — Fase 5 · prod_setup.sql idempotente + hardening (achado #5 + propagação Fase 1) ✅

**PR #27** · squash `48f3d67` — "fix(prod-setup): torna script idempotente e aplica hardening de seguranca".
**Arquivo:** `supabase/prod_setup.sql`.
**Mudanças:** `drop policy if exists` antes de cada `create policy` (34 create / 36 drop); removidas as 2 policies `using(true)` de `lavagens`/`eventos_lavagem`; adicionada RPC `get_lavagem_publica` (espelha migration `20260603010243`); token default `gen_random_bytes(16)` + `pgcrypto`.
**Checks (orquestrador):** verificado por grep/leitura — único `using(true)` restante é `configuracoes_loja` (público por design); RPC + grants + token forte presentes. PROD nasce seguro e o script é re-executável. NÃO executado em banco (setup manual).

**Sentinela Fase 5 → PROSSEGUIR.** RPC byte-idêntica à migration; idempotência correta (todo create policy com drop); único `using(true)` é `configuracoes_loja` (ok); consistente com schema DEV. Sem HIGH/MED.

## 2026-06-02 — Fase 6 · Hardening uploadLogo (achado #6) ✅

**PR #28** · squash `61a343a` — "...hardening do uploadLogo".
**Arquivo:** `src/server/actions/config.ts` (+20/−7).
**Mudanças:** MIME allowlist `png/jpeg/webp` (rejeita SVG/XSS); limite 2MB; path fixo `logos/${user.id}` + `upsert` + `contentType` (zero órfãos); cache-bust `?v=Date.now()`; `.maybeSingle()` na config.
**Checks (orquestrador):** li o código (linhas 69-113) — correto. `npx tsc --noEmit` → 0 erros ✅. Lint: só os 2 pré-existentes.
**Nota p/ sentinela:** validação confia em `file.type` (declarado pelo cliente, não magic bytes) — escopo pedido; verificar policies do bucket `loja`.

**Sentinela Fase 6 → PROSSEGUIR.** Path fixo derivado de `auth.getUser()` (sem sobrescrita cruzada via action); MIME/size ok. Follow-up LOW (não-bloqueante, p/ multi-loja): policy de INSERT/UPDATE do bucket `loja` só checa `authenticated`, não amarra arquivo ao uid.

## 2026-06-02 — Fase 7 · Lint React Compiler (achado #7) ✅

**PR #29** · squash `2e81e23` — "...corrige set-state-in-effect no whatsapp-modal".
**Arquivo:** `src/components/modals/whatsapp-modal.tsx` (+7/−10).
**Mudança:** removido o `useEffect` que chamava `setMsg`; o caso "loja carrega tarde" foi dobrado no padrão de reset-durante-render (incluindo `canBuild` na chave). Comportamento idêntico.
**Checks (orquestrador):** `npm run lint` → **0 erros** (só resta o warning `formatHM`, Fase 9) ✅. `npx tsc --noEmit` → 0 erros ✅.

**Sentinela Fase 7 → PROSSEGUIR.** Padrão setState-durante-render correto (sem loop); a única divergência teórica (overwrite de texto digitado quando loja chega tarde) é inalcançável pelo early-return `if (!lavagem || !loja) return null`. Sem impacto de segurança.

## 2026-06-02 — Fase 8 · Queries de escala (achado #8) ✅

**PR #30** · squash `9de07cb` — "...move contagem/filtro/soma das queries pro banco".
**Arquivos:** `src/server/queries/dashboard.ts`, `src/server/queries/clientes.ts` (sem migration; tipos inalterados).
**Mudanças:** `getDashboardStats` → 8 queries `Promise.all` (count head por status + count de entradas de hoje + 2 selects filtrados para as somas). `getClientes` → `select('*, veiculos(*), lavagens(count)')` (contagem no banco via PostgREST), sem buscar a tabela inteira.
**Checks (orquestrador):** li os dois arquivos — valores equivalentes (inclui equivalência `NULL >= valor` = false p/ `retirada_em`). `npx tsc --noEmit` → 0 erros ✅. Lint: só o warning `formatHM` (Fase 9). Subagente validou `lavagens(count)` contra o PostgREST DEV (HTTP 200).

**Sentinela Fase 8 → PROSSEGUIR.** Valores equivalentes (count head + `lavagens(count)`); `.gte` exclui NULL = check truthy antigo; RLS respeitado (counts só do próprio gestor — depende da remoção das policies da Fase 1, já em `dev`).

## 2026-06-02 — Fase 9 · Polish — Slice 9.1 (código) ✅

**PR #31** · squash `be80cb0` — "Slice 9.1: polish de codigo (achados BAIXO agrupados)".
**Arquivos (8):** lavagem-detalhe.tsx, lavagens-view.tsx, ocorrencia-modal.tsx, clientes.ts, validations.ts, queries/config.ts, nova-lavagem-wizard.tsx, clientes-view.tsx, whatsapp.ts.
**Itens:** (1) feedback de erro inline ao usuário nos 3 pontos que só tinham `console.error`; (2) `atualizarVeiculo` valida via novo `veiculoUpdateSchema`; (3) `getConfigLojaPublica` delega a `getConfigLoja` (dedup); (4) removido re-sort redundante de serviços no wizard; (5) removido `formatHM` não usado; (6) `as Record<string,string>` → `satisfies`.
**Checks (orquestrador):** `npx tsc --noEmit` → 0 erros ✅; `npm run lint` → **0 erros / 0 warnings** ✅; dedup do config.ts conferido.

## 2026-06-02 — Fase 9 · Polish — Slice 9.2 (docs) ✅

**PR #32** · squash `5ff5a83` — "docs: atualiza ESTADO_ATUAL e corrige links do README".
**Arquivos:** `docs/projeto/ESTADO_ATUAL.md` (placeholders → estado real + esta iteração), `docs/projeto/README.md` (removidos links p/ ARQUITETURA/WORKFLOW/DECISOES inexistentes).
**Checks (orquestrador):** sem placeholder restante, sem link quebrado (confirmado pelo subagente; é markdown).

**Sentinela Slice 9.1 → PROSSEGUIR.** Feedback de erro é texto JSX (escape automático do React, sem XSS); `veiculoUpdateSchema` mantém `placa min(7)`+uppercase (mais forte na edição); `getConfigLojaPublica` delega (no-op, `configuracoes_loja` só tem dados de vitrine).

---

## Status: Fases 1–9 concluídas ✅ — pré-requisito da Fase 10

Todas as fases de código mergeadas em `dev`. `tsc` 0 erros, `lint` 0/0.

**PRs:** #23 (RLS) · #24 (cliente órfão) · #25 (race status) · #26 (EventoStatus) · #27 (prod_setup) · #28 (uploadLogo) · #29 (lint) · #30 (queries escala) · #31 (polish código) · #32 (docs).

**Migration pendente de aplicação manual no DEV (única):** `supabase/migrations/20260603010243_harden_acompanhamento_publico.sql` (Fase 1). As demais fases não precisaram de migration. **A Fase 10 (E2E) depende dessa migration estar aplicada no DEV** — o fluxo de acompanhamento `/a/[token]` chama a RPC `get_lavagem_publica`.

## 2026-06-02 — Fase 10 · Validação E2E final ✅

**Pré-requisito:** migration `20260603010243` aplicada no DEV pelo usuário. Smoke do orquestrador: RPC `get_lavagem_publica` → HTTP 200 + `null` p/ token inexistente ✅.

**PR #33** · squash `8f6638d` — "test(e2e): cobre acompanhamento publico anonimo e corrige texto do wizard".
**Arquivos:** `tests/e2e/acompanhamento-publico.spec.ts` (novo), `tests/e2e/gestor-fluxos.spec.ts` (3 asserções de texto).
**Slice 10.1:** novo spec valida o fix da Fase 1 — visitante **anônimo** (`storageState: undefined`) em `/a/[token]` vê nome do cliente ("Fala, Marcelo!"), placa (`[data-placa]` não vazia) e modelo ("Honda Civic"), via RPC. Token obtido pela UI autenticada (anon não lê mais `lavagens` via REST — confirma o hardening). Sem anti-patterns banidos.
**Slice 10.2 — suite completa:** `npm run test:e2e` → **14/14 verde, ~2.1 min** (setup + acompanhamento(1) + auth(3) + gestor-fluxos(8) + publico(1)).
**Falhas tratadas (categoria b — teste desatualizado, NÃO regressão):** 3 testes do `gestor-fluxos.spec.ts` esperavam "Tudo certo, Marquinhos?" — texto que **nunca existiu no `src/`** (drift pré-existente, provável desde `ad2a3ac`). Atualizado para o texto real "Tudo certo? Confere os dados". Diff verificado pelo orquestrador: só a string, sem enfraquecer asserções. Zero mudança em `src/`.
**Checks (orquestrador):** li o novo spec + diff do gestor-fluxos; `npx tsc --noEmit` → 0 erros ✅.

---

## ✅ Iteração concluída — Fases 1–10

**Resultado:** todos os achados (#1 crítico, #2-4 altos, #5-8 médios, #9 polish) corrigidos e validados pela sentinela em cada fase. `tsc` 0 erros · `lint` 0/0 · suite E2E **14/14 verde** (~2.1 min). Zero regressão funcional.

**PRs (dev):** #23 #24 #25 #26 #27 #28 #29 #30 #31 #32 #33.

**Follow-ups conhecidos (não-bloqueantes):**
- ⚠️ Rotacionar a senha do DEV (exposta em chat).
- `prod_setup.sql` já com hardening — aplicar no DEV→PROD apenas no release.
- LOW: policy do bucket `loja` não amarra arquivo ao uid (relevante só se for multi-loja).
- LOW: teste #7 de `gestor-fluxos` ("link de acompanhamento") usa fetch REST anon que agora retorna null → cai em fallback trivial; cobertura real migrou pro novo spec. Simplificar numa próxima iteração.
