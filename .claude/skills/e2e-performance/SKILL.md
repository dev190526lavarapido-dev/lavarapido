---
name: e2e-performance
description: LEIA SEMPRE antes de criar, modificar ou debugar specs Playwright em tests/e2e/. Define praticas de performance + qualidade pra suite continuar rapida (objetivo <5min full, ou mais a medida que cresce). Cobre auth (storageState), execucao (mocks/sharding), configuracoes (tags/asset abort/baseURL), codigo (POM/acoes diretas) e anti-patterns banidos (waitForTimeout, page.pause).
---

# Skill: E2E Performance (Playwright)

## Quando ativar

**SEMPRE** que um agente (orquestrador ou subagente) for:
- Criar novo spec em `tests/e2e/`
- Modificar spec existente
- Adicionar fixture em `tests/e2e/fixtures/`
- Mudar `playwright.config.ts`
- Investigar test lento ou flaky
- Debugar suite quebrada

Sem excecao. A skill e cumulativa — toda mudanca em E2E deve manter os principios abaixo.

## Principio mestre

> **E2E tem que ser rapido sem perder qualidade.** Lentidao acumula: spec lento x CI = dor real. Toda escolha de design do spec deve responder a pergunta "isso e o caminho mais rapido pra validar a regra que importa?".

## Bloco 0 — Escopo focado (LEIA ANTES DE QUALQUER `playwright test`)

**Regra de ouro: nunca rodar a suite inteira "por garantia".** Antes de qualquer comando Playwright (CLI direto OU via MCP Playwright), pare e responda 3 perguntas:

1. **O que mudou?** — arquivo(s) especifico(s), area(s) do produto.
2. **Que specs cobrem essa area?** — listar pelo nome. Exemplos:
   - Mexeu em `src/components/checkout/FormPagamento.tsx` -> `checkout-cartao.spec.ts` + `checkout-pix.spec.ts`. **NAO** `perfil-usuario.spec.ts`, `admin-relatorio.spec.ts`, etc.
   - Mexeu em `src/pages/dashboard/Perfil.tsx` -> `perfil-editar.spec.ts` + (talvez) `perfil-avatar.spec.ts`. **NAO** rodar suite inteira.
   - Mexeu em RPC compartilhada (ex: `criar_pedido_com_pagamentos`) -> ai sim, specs dependentes de varias areas.
3. **Que projects do Playwright importam?** — ex: `chromium-desktop` ou `mobile-app`? Specs de desktop nao precisam rodar em mobile e vice-versa.

### Comandos focados (preferir SEMPRE)

```bash
# 1 spec so:
npx playwright test tests/e2e/<area-feature>.spec.ts

# 1 spec + 1 project:
npx playwright test tests/e2e/<area-feature>.spec.ts --project=chromium-desktop

# Varios specs por padrao (glob):
npx playwright test tests/e2e/<area>-*.spec.ts

# Por tag (quando estiverem marcados):
npx playwright test --grep @critical

# Linha especifica de um spec (rapidissimo no debug):
npx playwright test tests/e2e/<area-feature>.spec.ts:158
```

### Quando rodar a suite inteira (`npm run test:e2e`)

Apenas em 2 momentos:
- **Final da iteracao antes de entregar o resultado** — ultima checagem de regressao (mesmo assim, suite focada antes durante as slices).
- **Antes de promover `dev -> main`** — `npx playwright test --repeat-each 3 --reporter=line`.

Em qualquer outro momento: rode focado. Se descobrir bug na area focada, conserte, re-rode focado, e SO no fim da iteracao valide com a suite inteira.

### Quando criar specs novos: dividir em especificos e pequenos

Nao escrever 1 spec gigante "fluxo completo". Dividir por feature/area:
- OK `checkout-cartao.spec.ts` (pagamento cartao)
- OK `checkout-pix.spec.ts` (pagamento PIX)
- RUIM `app-fluxo-completo.spec.ts` (cria pedido + paga + envia + finaliza + ...)

Spec focado:
- Roda em segundos (nao minutos)
- Falha aponta direto pra area quebrada
- Permite rodar so ele em loop sem esperar o resto
- Cleanup e simples (escopo pequeno)

Limite pratico: **<100 linhas, <5 expects principais por spec**. Se passar, quebrar em 2.

## Bloco 1 — Autenticacao eficiente

### O que fazer

**Reusar `storageState`.** Auth roda 1x no setup project (`tests/e2e/setup/auth.setup.ts`) e gera arquivos de estado por perfil (ex: `.auth/admin.json`, `.auth/usuario.json`). Cada spec inclui:

```ts
test.use({ storageState: 'tests/e2e/.auth/admin.json' });
```

Logado em ms, sem passar pela UI de login.

**Login programatico via API quando precisar de outro usuario.** Em vez de UI, use `supabase.auth.signInWithPassword` direto via `page.evaluate` ou via fixture admin que cria user + retorna sessao pronta.

**`signOut()` com `scope: 'local'` quando aplicavel.** O default `'global'` revoga em todas as abas/sessoes e quebra storageState dos outros projects.

### O que NAO fazer

- Login via UI dentro de cada spec (segundos perdidos x N specs)
- `page.goto('/login')` + `fill` + `click` em todo `beforeEach`
- Criar novo user via Auth Admin pra cada spec sem cleanup (lixo no banco DEV)

### Padrao recomendado

`tests/e2e/setup/auth.setup.ts` faz login UI 1x pra cada perfil -> salva storageState -> demais specs herdam via `test.use({ storageState })`. Mantenha esse padrao.

## Bloco 2 — Otimizacao de execucao

### Paralelismo + sharding

Comece com `workers: 1` no `playwright.config.ts` pra evitar conflito de estado entre testes. Quando a suite passar de 60 specs, considerar:

- Tags pra rodar so o necessario em PRs pequenos (`@critical`)
- Sharding em CI: `npx playwright test --shard=1/3` em 3 jobs paralelos
- `fullyParallel: true` quando os specs forem realmente independentes (cuidar com seeds compartilhadas)

### Mocks de API com `page.route()`

Pra integracoes externas que **nao sao o foco do teste**:

```ts
// Mock de API externa pra spec nao depender de servico terceiro:
await page.route('**/api.externa.com/endpoint/**', (route) =>
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ resultado: 'mock-data' }),
  }),
);
```

**Quando usar mock**: validar fluxo da UI sem depender de servico externo, deixar test deterministico, economizar quota.
**Quando NAO usar**: o objetivo do spec e justamente validar a integracao real (ex: `integracao-smoke.spec.ts`).

### Auto-wait nativo e seu amigo

Playwright ja espera elementos automaticamente em `click`, `fill`, `expect(locator).toBeVisible()`. Use isso. Nao inventar `await page.waitForTimeout(2000)` "pra ter certeza".

```ts
// Usa auto-wait + timeout especifico
await expect(page.getByTestId('saldo-display')).toBeVisible({ timeout: 8_000 });

// RUIM: Espera fixa ineficiente
await page.waitForTimeout(2000);
await page.click(...);
```

### `expect.poll` pra realtime

Quando a UI atualiza via Supabase realtime (~500ms), use `expect.poll` em vez de `waitForTimeout`:

```ts
await expect
  .poll(async () => (await supabaseAdmin.from('tabela').select('*').eq('id', id).single()).data?.status,
    { timeout: 5_000 })
  .toBe('processado');
```

## Bloco 3 — Configuracoes

### Tags pra filtros

Marque specs por importancia:

```ts
test.describe('@critical fluxo principal', () => { ... });
test.describe('@smoke login', () => { ... });
```

Rodar so criticos:
```bash
npx playwright test --grep @critical
```

### Abortar assets que nao importam

Em specs onde imagens/fontes nao fazem diferenca:

```ts
await page.route('**/*.{png,jpg,jpeg,webp,svg,woff,woff2,ttf}', (route) => route.abort());
```

Reduz carga inicial em ~30-50%. **Cuidado**: nao use em spec que verifica visual (icone correto, foto de avatar).

### `baseURL` correto

`playwright.config.ts` tem `use.baseURL`. Sempre use paths relativos:

```ts
await page.goto('/dashboard');   // OK
await page.goto('http://localhost:5173/dashboard');   // RUIM: verbose, fragil
```

### `webServer` aponta pra DEV

Configure `webServer.command` pra carregar variaveis de ambiente de DEV (ex: `.env.test`). Nunca apontar pra PROD.

## Bloco 4 — Codigo

### Page Object Model (POM) — quando crescer

Comece com specs diretos. A medida que componentes complexos viram comuns (ex: mesmo formulario usado em 3 specs), considerar extrair pra `tests/e2e/pages/`:

```ts
// tests/e2e/pages/DashboardPage.ts
export class DashboardPage {
  constructor(private page: Page) {}
  async abrirSecao(nome: string) { ... }
  async confirmarAcao() { ... }
}
```

Nao fazer cedo (regra #1: pragmatismo). So extrair quando 3+ specs duplicarem o mesmo trecho.

### Acoes diretas via URL

Em vez de:
```ts
await page.click('[data-testid="nav-dashboard"]');
await expect(page).toHaveURL('/dashboard');
```

Use:
```ts
await page.goto('/dashboard');
```

Exceto quando o teste valida explicitamente a navegacao (ex: nav menu funciona).

### Setup de dados via admin client (nao UI)

Pra deixar o estado certo pra o teste, use `supabaseAdmin` direto:

```ts
// Em vez de criar dados via UI no beforeEach (lento), use RPC ou insert direto:
const { data } = await supabaseAdmin.rpc('criar_registro', { payload });
```

UI so pra validar a feature em si. Dados de pre-condicao = via API.

## Anti-patterns banidos

- **Rodar `npm run test:e2e` (suite inteira) quando mexeu numa area especifica** — viola Bloco 0. Rode focado primeiro; suite inteira so pre-merge ou pre-release.
- Rodar specs de um project quando so alterou area de outro project (ex: desktop vs mobile)
- Spec gigante "fluxo completo" misturando 5 features — quebrar em 1 spec por feature (ver Bloco 0)
- `await page.waitForTimeout(N)` — sempre prefira `expect(locator).toBeVisible()`, `expect.poll()`, ou `waitForResponse()`
- `await page.pause()` em codigo commitado — ferramenta de debug local apenas
- `setTimeout` ou `sleep` artificial
- Login via UI repetido em cada teste
- Setup de pre-condicao via UI quando ha RPC/admin disponivel
- Selector fragil (CSS profundo / XPath) em vez de `data-testid`
- Spec sem cleanup (deixa lixo no banco DEV)
- `signOut({scope: 'global'})` em spec sem necessidade
- Mock indiscriminado (mockar tudo perde o ponto do E2E)
- Spec gigante (>100 linhas, >5 expects) — quebrar em 2-3

## Comandos uteis

### Profile time per test

```bash
npx playwright test --reporter=list,html
# HTML report mostra duracao de cada step
npx playwright show-report
```

### Rodar 1 spec especifico

```bash
npx playwright test tests/e2e/<area-feature>.spec.ts
```

### Modo headed pra ver o que ta rolando

```bash
npx playwright test --headed --workers=1
```

### Trace pra debug

```bash
npx playwright test --trace on
npx playwright show-trace test-results/<...>/trace.zip
```

### Estabilidade antes de mergear

```bash
npx playwright test --reporter=line
```

Suite travada sem flake = pronto pra `dev`.

## Cleanup obrigatorio

Toda spec que cria dados em DEV deve limpar no `afterEach` ou `afterAll`. Convencoes recomendadas:

- Dados de teste com prefix identificavel (ex: `test-`) -> cleanup global no `global-teardown`
- Dados com flag de teste -> apaga no teardown
- Registros criados no spec -> deletar via `supabaseAdmin.from('tabela').delete().eq('id', x)` no afterEach

Sanity check: ao fim do desenvolvimento do spec, rodar 2x seguidas — deve continuar verde. Se nao, ha leak de estado.

## Anti-PROD obrigatorio

Fixtures que conectam ao Supabase **devem rejeitar URL de PROD** com throw. Se for criar fixture que conecta ao banco, incluir essa guarda:

```ts
if (url.includes('{{SUPABASE_PROD_REF}}')) {
  throw new Error(`Suite E2E tentando rodar contra PROD (${url}). Aborte.`);
}
```

Substitua `{{SUPABASE_PROD_REF}}` pelo project ref real do seu Supabase de producao.

## Targets de tempo (objetivo)

- **Spec individual**: <5s pra unitario, <15s pra fluxo completo
- **Setup project (auth.setup)**: <10s por perfil
- **Suite full**: <5min em DEV (ajustar conforme a suite cresce)

Se cruzar limites, abrir issue ou investigar o gargalo.

## Integracao com outras skills

- [`iteracao-prd`](../iteracao-prd/SKILL.md) — quando Slice toca `tests/e2e/`, ler esta skill antes
- [`orquestrador`](../orquestrador/SKILL.md) — brief do subagente que mexe em test deve mencionar esta skill explicitamente:

  ```
  ## Restricoes
  - Consulte `.claude/skills/e2e-performance/SKILL.md` antes de escrever specs.
    Em especial: storageState reuso, sem waitForTimeout, mocks pra externos.
  ```

- [`dev-prod-workflow`](../dev-prod-workflow/SKILL.md) — testes SEMPRE rodam contra DEV (`.env.test`)
