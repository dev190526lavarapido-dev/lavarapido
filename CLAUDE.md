# lavarapido — Regras do Projeto

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

App de gestão de lava-rápido com painel do gestor, página pública, acompanhamento por token e WhatsApp via wa.me.

**Stack:** Next.js 16, TypeScript, TailwindCSS v4, shadcn/ui, Supabase (Auth + Storage + Postgres + RLS), Zod, React Hook Form

**Ambiente de produção:** Vercel (deploy automático a partir de `main`)

---

## 3. Regras críticas

### 3.1 DEV vs PROD — bancos separados

| Ambiente | Supabase Ref | URL | Branch Git | Uso |
|----------|-------------|-----|------------|-----|
| **DEV** | `xvwfnldvbxequhabunqi` | `https://xvwfnldvbxequhabunqi.supabase.co` | `dev` | Todo trabalho de desenvolvimento, testes, migrations |
| **PROD** | `jlcjguchifzvhkczveie` | `https://jlcjguchifzvhkczveie.supabase.co` | `main` | Produção — só recebe promoção autorizada via skill `promover-dev-main` |

- **NUNCA** rodar migrations, seeds ou queries com escrita direto no banco PROD.
- **NUNCA** fazer push direto na branch `main`.
- Promoção dev → main **somente** via PR com confirmação dupla do usuário (skill `promover-dev-main`).
- `.env.local` SEMPRE aponta pro banco DEV. Vercel cuida das env vars de PROD.
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

- Migrations SQL ficam em `supabase/migrations/`.
- Sempre criar via CLI (`supabase migration new nome_descritivo`).
- Testar em DEV antes de promover.
- Nunca editar migration já aplicada; criar nova pra corrigir.

### 3.7 Restrições do produto

MVP single-tenant (1 loja). WhatsApp via wa.me (não Cloud API). Sem multi-loja no MVP.

### 3.8 Testes E2E

- Specs Playwright ficam em `tests/e2e/`.
- **Antes de criar/modificar qualquer spec**, ler a skill `e2e-performance`.
- **Banido:** `waitForTimeout`, `page.pause`, login via UI repetido (usar `storageState`).
- Entre passos de uma iteração, rodar só a spec do passo atual.
- Suite full apenas 1x no fim da iteração, antes do PR.
- Objetivo: suite completa < 5 min.

---

## 4. Comandos principais

| Comando | O que faz |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npx tsc --noEmit` | Roda testes unitários |
| `npm run test:e2e` | Roda testes E2E |
| `npm run lint` | Lint + format |
| `supabase migration new <nome>` | Cria nova migration |

---

## 5. Skills disponíveis

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

```
lavarapido/
├── src/                    # Código fonte
│   └── app/
│       ├── (public)/a/[token]/  # Acompanhamento público por token
│       ├── gestor/              # Painel do gestor (dashboard, lavagens, clientes, catálogo, config, nova-lavagem)
│       └── login/               # Autenticação
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

- [x] Substituir todos os `{{PLACEHOLDERS}}` neste arquivo
- [x] Criar `docs/projeto/README.md` com descrição do estado atual
- [x] Configurar `.env.local` com variáveis de DEV
- [x] Verificar que `supabase/config.toml` aponta pra DEV
- [x] Copiar skills necessárias para `.claude/skills/`
- [x] Rodar `npm install` (ou equivalente)
- [x] Rodar build + testes pra confirmar que tudo funciona
- [x] Commitar este CLAUDE.md configurado
