# {{PROJECT_NAME}} — Regras do Projeto

<!-- SETUP: preencha todos os {{PLACEHOLDERS}} ao iniciar um novo projeto -->

> Você é uma IA entrando neste projeto. **Leia este arquivo primeiro**.
> Depois leia `docs/projeto/README.md` pra ter o estado atual completo.

---

## 1. Regras fundamentais de comunicação

1. **Pragmatismo** — menor código / menor quantidade de etapas possível.
2. **Direto ao ponto** — sem enrolação, sem repetir o que já foi dito.
3. **Explicar antes de agir** — descrever detalhadamente o que vai ser feito antes de mexer em qualquer arquivo.
4. **Confirmar entendimento** — repetir o que entendeu e esperar OK antes de prosseguir.
5. **Sempre em português (PT-BR)**.
6. **Perguntas com opções clicáveis** — usar AskUserQuestion com alternativas; nunca pedir resposta digitada avulsa.
7. **Trabalho passo a passo** — o usuário valida cada passo antes do próximo; commits pequenos; perguntar em qualquer ambiguidade.

---

## 2. O que é

<!-- SETUP: descreva o projeto em 2-3 frases -->
{{PROJECT_DESCRIPTION}}

**Stack:** {{STACK_DESCRIPTION}}
<!-- Exemplo: Vite + React + TypeScript, Supabase (auth + db + storage), Tailwind, Vercel -->

**Ambiente de produção:** {{PROD_URL}}
<!-- Exemplo: https://meuapp.vercel.app -->

---

## 3. Regras críticas

### 3.1 DEV vs PROD — bancos separados

| Ambiente | Supabase Ref | Branch Git | Uso |
|----------|-------------|------------|-----|
| **DEV** | `{{SUPABASE_DEV_REF}}` | `dev` | Todo trabalho de desenvolvimento, testes, migrations |
| **PROD** | `{{SUPABASE_PROD_REF}}` | `main` | Produção — só recebe promoção autorizada |

<!-- SETUP: preencha os refs do Supabase de cada ambiente -->

- **NUNCA** rodar migrations, seeds ou queries com escrita direto no banco PROD.
- Variáveis de ambiente DEV e PROD são separadas; conferir `.env` / `.env.local` antes de rodar qualquer comando.

### 3.2 Branches e fluxo Git

- `main` = produção. **Nunca fazer push direto pra main.**
- `dev` = branch de trabalho principal.
- Para cada iteração/passo: criar branch `passo-N` a partir de `dev` → PR pra `dev` → squash merge.
- Promoção `dev → main` só com ordem explícita do usuário (duas confirmações).

### 3.3 Plano antes de executar

- Toda iteração não-trivial passa por **PRD + PLANO aprovados** antes de qualquer código.
- Fluxo: PRD.md → PLANO.md → EXECUCAO.md (com checklist de tarefas).
- Iterações ficam em `docs/iteracoes/YYYY-MM-DD_nome/`.

### 3.4 Documentação viva

- O estado atual do projeto é documentado em `docs/projeto/`.
- Atualizar documentação sempre que houver mudança relevante (nova feature, migration, config).

### 3.5 Workflow PR obrigatório

- Branch `passo-N` a partir de `dev` → PR pra `dev` → squash merge.
- Pode mergear PRs em `dev` sem pedir ao usuário.
- PRs pra `main` só com autorização explícita ou release.

### 3.6 Migrations

<!-- SETUP: descreva a convenção de migrations do projeto -->
- Migrations SQL ficam em `{{MIGRATIONS_PATH}}`.
<!-- Exemplo: supabase/migrations/ -->
- Sempre criar via CLI (`supabase migration new nome_descritivo`).
- Testar em DEV antes de promover.
- Nunca editar migration já aplicada; criar nova pra corrigir.

### 3.7 Restrições do produto

<!-- SETUP: liste aqui regras de negócio invioláveis do seu projeto -->
<!-- Exemplo:
- Pedido só pode ser editado enquanto status = "pendente"
- Usuário sem role "admin" não acessa painel de gestão
-->
{{PRODUCT_CONSTRAINTS}}

### 3.8 Testes E2E

- Specs Playwright ficam em `{{E2E_PATH}}`.
<!-- Exemplo: tests/e2e/ -->
- **Antes de criar/modificar qualquer spec**, ler a skill `e2e-performance`.
- **Banido:** `waitForTimeout`, `page.pause`, login via UI repetido (usar `storageState`).
- Entre passos de uma iteração, rodar só a spec do passo atual.
- Suite full apenas 1x no fim da iteração, antes do PR.
- Objetivo: suite completa < 5 min.

---

## 4. Comandos principais

<!-- SETUP: preencha com os comandos do seu projeto -->

| Comando | O que faz |
|---------|-----------|
| `{{CMD_DEV}}` | Inicia servidor de desenvolvimento |
| `{{CMD_BUILD}}` | Build de produção |
| `{{CMD_TEST}}` | Roda testes unitários |
| `{{CMD_E2E}}` | Roda testes E2E |
| `{{CMD_LINT}}` | Lint + format |
| `{{CMD_MIGRATION}}` | Cria nova migration |

<!-- Exemplo:
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npx vitest` | Roda testes unitários |
| `npx playwright test` | Roda testes E2E |
| `npm run lint` | Lint + format |
| `supabase migration new nome` | Cria nova migration |
-->

---

## 5. Skills disponíveis

<!-- SETUP: remova skills que não se aplicam ao projeto; adicione novas conforme necessário -->

| Skill | Quando usar |
|-------|-------------|
| `iteracao-prd` | Transformar PRD em plano executável (PRD.md + PLANO.md + EXECUCAO.md) |
| `orquestrador` | Iterações grandes (>3 fases / >2h). Claude vira orquestrador e dispara subagentes |
| `sentinela-seguranca` | Verificar segurança (RLS, permissões, secrets expostos) |
| `dev-prod-workflow` | Qualquer operação que toque banco Supabase, branches ou PRs |
| `e2e-performance` | Antes de criar/modificar specs Playwright |
| `promover-dev-main` | Release: promover dev → main (requer duas confirmações) |

---

## 6. Estrutura do projeto

<!-- SETUP: adapte a árvore abaixo à estrutura real do seu projeto -->

```
{{PROJECT_NAME}}/
├── src/                    # Código fonte
├── public/                 # Assets estáticos
├── docs/
│   ├── projeto/            # Estado atual do projeto (README.md, arquitetura, decisões)
│   └── iteracoes/          # Histórico de iterações (PRD + PLANO + EXECUCAO)
├── supabase/
│   └── migrations/         # Migrations SQL
├── tests/
│   └── e2e/                # Specs Playwright
├── .env.local              # Variáveis de ambiente (NÃO commitar)
├── CLAUDE.md               # Este arquivo
└── package.json
```

---

## 7. Onde achar mais

| O que | Onde |
|-------|------|
| Estado atual do projeto | `docs/projeto/README.md` |
| Arquitetura e decisões | `docs/projeto/ARQUITETURA.md` |
| Histórico de iterações | `docs/iteracoes/` |
| Variáveis de ambiente | `.env.local` / `.env.example` |
| Configuração Supabase | `supabase/config.toml` |
| Skills do harness | `.claude/skills/` |
| Configuração do harness | `.claude/settings.json` |

---

## 8. Checklist de setup inicial

<!-- SETUP: use esta checklist ao configurar o projeto pela primeira vez -->

- [ ] Substituir todos os `{{PLACEHOLDERS}}` neste arquivo
- [ ] Criar `docs/projeto/README.md` com descrição do estado atual
- [ ] Configurar `.env.local` com variáveis de DEV
- [ ] Verificar que `supabase/config.toml` aponta pra DEV
- [ ] Copiar skills necessárias para `.claude/skills/`
- [ ] Rodar `npm install` (ou equivalente)
- [ ] Rodar build + testes pra confirmar que tudo funciona
- [ ] Commitar este CLAUDE.md configurado
