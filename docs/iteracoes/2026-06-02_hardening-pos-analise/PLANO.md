# Plano: Hardening pós-análise de ponta a ponta

> Iteração: `2026-06-02_hardening-pos-analise` · Status: 🟢 concluída (Fases 1–10, PRs #23–#33; E2E 14/14)
> PRD: [PRD.md](PRD.md) · Execução: [EXECUCAO.md](EXECUCAO.md)

## Contexto

Pós-análise de ponta a ponta (saúde + segurança + qualidade). Corrigir os achados, cada um numa
fase, com `sentinela-seguranca` validando cada fase contra este plano. Fechamento com suite E2E
completa e garantia de zero regressão. Tudo em DEV. Ver [PRD.md](PRD.md).

## Premissas e restrições

- Trabalho 100% em **DEV** (`xvwfnldvbxequhabunqi`). **Nunca** tocar PROD.
- Cada fase de código → branch `passo-N-slug` a partir de `dev` → PR → squash merge em `dev`.
- Migrations só via `supabase migration new` (nunca editar migration aplicada).
- `sentinela-seguranca` roda ao fim de cada fase, validando aderência ao plano + regressões.
- Entre fases, rodar só a verificação relevante (tsc/lint/spec do tema). Suite E2E **full** só na Fase 10.
- Ler skill `e2e-performance` antes de tocar em qualquer spec.
- Ordem: crítico → altos → médios → polish → validação E2E.

## Fases

### Fase 1 · 🔴 Corrigir RLS público do acompanhamento por token — código ✅ (PR #23) · migration aguardando aplicação manual no DEV

Objetivo: eliminar o vazamento (`using(true)`) e restaurar a feature de acompanhamento via RPC segura.
> Sentinela: PROSSEGUIR. Migration `20260603010243` criada, **aplicação manual pendente** (usuário aplica em DEV/PROD). Smoke da rota `/a/[token]` após aplicar.

- **Slice 1.1** · Migration de RPC `SECURITY DEFINER`
  - [ ] Task 1.1.1 — `supabase migration new harden_acompanhamento_publico`
  - [ ] Task 1.1.2 — Criar função `get_lavagem_publica(p_token text)` `SECURITY DEFINER` que valida o token e retorna a lavagem + cliente + veículo + serviço + eventos (JSON), sem expor outras linhas
  - [ ] Task 1.1.3 — `revoke`/`grant execute` adequado (anon pode executar a RPC)
  - [ ] Task 1.1.4 — Reforçar token: default do schema para `encode(gen_random_bytes(16),'hex')` (128 bits) em novas lavagens
- **Slice 1.2** · Remover policies inseguras
  - [ ] Task 1.2.1 — `drop policy` das duas `using(true)` em `lavagens` e `eventos_lavagem`
  - [ ] Task 1.2.2 — Garantir que o gestor continua vendo tudo (policies `auth.uid()=user_id` intactas)
- **Slice 1.3** · Ajustar app
  - [ ] Task 1.3.1 — `publicas.ts:getLavagemPorToken` passa a chamar a RPC via `supabase.rpc(...)`
  - [ ] Task 1.3.2 — `lavagens.ts:criarLavagem` usa token forte (UUID completo ou gen_random_bytes) consistente com o schema
  - [ ] Task 1.3.3 — Verificar `(public)/a/[token]/page.tsx` renderiza cliente/veículo corretamente
  - [ ] Task 1.3.4 — `tsc` limpo + smoke manual da rota `/a/[token]`
- **Sentinela Fase 1**

### Fase 2 · 🟠 Transação em `criarClienteComVeiculo` (cliente órfão)

Objetivo: evitar cliente órfão quando a criação do veículo falha.

- **Slice 2.1** · Reordenar validação / atomicidade
  - [ ] Task 2.1.1 — Validar `veiculoSchema` ANTES de inserir o cliente (mover `safeParse` pro topo)
  - [ ] Task 2.1.2 — Se insert do veículo falhar, deletar o cliente recém-criado (compensação) ou usar RPC transacional
  - [ ] Task 2.1.3 — `tsc` limpo + teste manual do caminho de erro
- **Sentinela Fase 2**

### Fase 3 · 🟠 Atomicidade em `mudarStatus` (race condition)

Objetivo: tornar a transição de status atômica (compare-and-swap).

- **Slice 3.1** · Compare-and-swap no update
  - [ ] Task 3.1.1 — Adicionar `.eq('status_atual', statusAtual)` no update; tratar 0 linhas como "estado já mudou"
  - [ ] Task 3.1.2 — Retornar erro amigável quando a transição perde a corrida
  - [ ] Task 3.1.3 — `tsc` limpo + teste manual de clique duplo
- **Sentinela Fase 3**

### Fase 4 · 🟠 Corrigir status inicial `'entrada'` inválido

Objetivo: alinhar o primeiro evento ao domínio de status.

- **Slice 4.1** · Padronizar evento inicial
  - [ ] Task 4.1.1 — Decidir: remover o evento `'entrada'` OU adicionar `entrada` formalmente ao enum/`STATUS_META`
  - [ ] Task 4.1.2 — Aplicar a decisão em `lavagens.ts:criarLavagem` e consumidores (`Timeline`, `STATUS_META`)
  - [ ] Task 4.1.3 — `tsc` limpo + verificar timeline da lavagem
- **Sentinela Fase 4**

### Fase 5 · 🟡 `prod_setup.sql` idempotente

Objetivo: setup de PROD re-executável sem abortar (sem aplicar em PROD agora).

- **Slice 5.1** · Drop-if-exists nas policies
  - [ ] Task 5.1.1 — Prefixar cada `create policy` com `drop policy if exists` (ou bloco `do $$ ... exception`)
  - [ ] Task 5.1.2 — Revisar consistência com as migrations (mesmas policies)
  - [ ] Task 5.1.3 — Validar sintaxe SQL (dry parse / lint SQL); NÃO executar em PROD
- **Slice 5.2** · Propagar fix da Fase 1 ao PROD (apontado pela sentinela)
  - [ ] Task 5.2.1 — `prod_setup.sql`: remover as 2 policies `using(true)` (linhas ~196/201) e adicionar a RPC `get_lavagem_publica` + grants + token default forte, espelhando a migration `20260603010243`
- **Sentinela Fase 5**

### Fase 6 · 🟡 Hardening de `uploadLogo`

Objetivo: validar arquivo no servidor e parar de acumular logos órfãs.

- **Slice 6.1** · Validação + caminho determinístico
  - [ ] Task 6.1.1 — Validar `file.type` (allowlist de imagem) e `file.size` no servidor
  - [ ] Task 6.1.2 — Caminho fixo por user (`logos/${user.id}.webp`) com `upsert:true` (sem acúmulo)
  - [ ] Task 6.1.3 — Garantir upsert do registro de config (sem `.single()` quebrar quando não existe)
  - [ ] Task 6.1.4 — `tsc` limpo + teste manual de upload
- **Sentinela Fase 6**

### Fase 7 · 🟡 Corrigir lint do React Compiler (`whatsapp-modal.tsx`)

Objetivo: remover o erro `react-hooks/set-state-in-effect`.

- **Slice 7.1** · Derivar estado sem setState em effect
  - [ ] Task 7.1.1 — Refatorar `setMsg(buildMsg(activeTipo))` para `useMemo`/`useState(() => ...)`/`key`
  - [ ] Task 7.1.2 — `npm run lint` sem erros + comportamento do modal preservado
- **Sentinela Fase 7**

### Fase 8 · 🟡 Mover contagem/filtro de queries pro banco (escala)

Objetivo: parar de transferir tabelas inteiras pro JS em dashboard/clientes.

- **Slice 8.1** · Counts/filtros no Postgres
  - [ ] Task 8.1.1 — `getDashboardStats` filtra por data/status no banco (`.gte`/`.eq` + `count`)
  - [ ] Task 8.1.2 — `getClientes` usa count agregado por cliente (view/RPC ou `count head:true`)
  - [ ] Task 8.1.3 — `tsc` limpo + valores conferem com a versão antiga (dashboard e lista de clientes)
- **Sentinela Fase 8**

### Fase 9 · 🟢 Polish (achados BAIXO agrupados)

Objetivo: limpar inconsistências menores. Tasks independentes — pode virar 1 PR.

- **Slice 9.1** · Código
  - [ ] Task 9.1.1 — Feedback de erro ao usuário onde hoje só há `console.error` (lavagem-detalhe, lavagens-view, ocorrencia-modal)
  - [ ] Task 9.1.2 — `atualizarVeiculo` valida com `veiculoSchema` (consistência Zod)
  - [ ] Task 9.1.3 — Consolidar `getConfigLoja`/`getConfigLojaPublica` (diferenciar escopo ou reutilizar)
  - [ ] Task 9.1.4 — Remover re-sort redundante de serviços no `nova-lavagem-wizard`
  - [ ] Task 9.1.5 — Remover `formatHM` não usado + casts desnecessários (`as Record<string,string>`)
- **Slice 9.2** · Docs
  - [ ] Task 9.2.1 — Atualizar `docs/projeto/ESTADO_ATUAL.md` (remover placeholders)
  - [ ] Task 9.2.2 — Corrigir links quebrados no `docs/projeto/README.md` (ARQUITETURA/WORKFLOW/DECISOES)
- **Sentinela Fase 9**

### Fase 10 · ✅ Validação E2E final + zero regressão

Objetivo: garantir que nada quebrou e cobrir o ponto frágil corrigido.

- **Slice 10.1** · Cobrir o fix crítico
  - [ ] Task 10.1.1 — (ler skill `e2e-performance` antes) Ajustar/adicionar spec de acompanhamento público validando que cliente/veículo aparecem após o fix da Fase 1
- **Slice 10.2** · Suite full
  - [ ] Task 10.2.1 — Rodar `npm run test:e2e` completa
  - [ ] Task 10.2.2 — Se falhar: investigar causa real, distinguir regressão de teste desatualizado, corrigir SEM regredir as melhorias
  - [ ] Task 10.2.3 — Suite verde validando todos os fluxos existentes
- **Sentinela Fase 10**

## Verificação de conclusão

- [x] Achados #1–#9 corrigidos e validados pela sentinela em cada fase
- [x] `npx tsc --noEmit` limpo
- [x] `npm run lint` sem erros
- [x] Suite E2E completa verde (14/14, ~2.1 min)
- [x] EXECUCAO.md preenchido com resultados de todas as Fases
- [x] `docs/projeto/` (estado) atualizado
- [x] Nenhuma regressão funcional

## Riscos e decisões pendentes

- **Fase 1** é a mais sensível (muda contrato da leitura pública + RLS). Smoke manual obrigatório
  antes do PR; a sentinela deve confirmar que o gestor ainda vê tudo e o anônimo só vê via RPC.
- **Fase 4**: decisão entre remover `'entrada'` ou formalizá-lo — confirmar a leitura do domínio antes de aplicar.
- **Fase 8**: refatorar query pode alterar números do dashboard — comparar antes/depois.
- E2E rodam contra DEV (workers:1) — não rodar em paralelo com outras escritas no banco.
