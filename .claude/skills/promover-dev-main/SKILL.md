---
name: promover-dev-main
description: Use APENAS quando o usuário tiver confirmado em DUAS etapas (no chat) que quer promover dev → main. Conduz o release ponta-a-ponta: consulta Context7 pra docs atuais Vercel/Supabase, cria dossiê em docs/pr_main/YYYY-MM-DD_release-N/, aplica migrations em PROD ANTES do merge, abre PR dev→main, valida deploy Vercel, atualiza ESTADO_ATUAL.md, retorna linkado a DEV.
---

# Skill: Promover dev → main (release pra produção)

## Variáveis do projeto

| Variável | Valor |
|---|---|
| `{{PROD_URL}}` | *(definir após primeiro deploy — ex: `https://lavarapido.vercel.app`)* |
| `{{SUPABASE_DEV_REF}}` | `xvwfnldvbxequhabunqi` |
| `{{SUPABASE_PROD_REF}}` | *(usuário vai fornecer as chaves PROD)* |
| `{{GITHUB_REPO}}` | `dev190526lavarapido-dev/lavarapido` |

## Setup Vercel (primeira vez)

1. Importar repositório no Vercel Dashboard (framework: Next.js, auto-detected)
2. Configurar env vars no Vercel — **separar por ambiente**:

| Variável | Production | Preview / Development |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do Supabase PROD | URL do Supabase DEV |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Key PROD | Key DEV |

3. Branch settings: `main` = Production, pushes em `dev` geram Preview
4. Build command: `next build` (auto)
5. Framework preset: Next.js (auto-detected)

### Checklist pós-import Vercel

- [ ] Env vars de PROD configuradas (Supabase PROD URL + key)
- [ ] Env vars de Preview configuradas (Supabase DEV URL + key)
- [ ] Domínio customizado apontado (se houver)
- [ ] Supabase Auth redirect URIs atualizadas com domínio Vercel
- [ ] Primeiro deploy em main sucesso (HTTP 200)
- [ ] Login funciona em produção
- [ ] Storage bucket `loja` existe no Supabase PROD

## Setup Supabase PROD (primeira vez)

1. Criar projeto Supabase PROD (ou receber chaves do usuário)
2. Aplicar TODAS as migrations em sequência:
   ```bash
   supabase link --project-ref <PROD_REF>
   supabase db push --linked
   ```
3. Criar storage bucket `loja` (executar SQL da migration `20260520150000_create_storage_bucket_loja.sql`)
4. Configurar Auth:
   - Site URL = domínio Vercel de produção
   - Redirect URIs: `https://<dominio>/auth/callback`, `https://<dominio>/gestor/dashboard`
5. Seed de dados iniciais (gestor user + config loja) via Dashboard ou SQL
6. Voltar link pra DEV: `supabase link --project-ref xvwfnldvbxequhabunqi`

## Quando ativar

**Somente após confirmação dupla explícita do usuário no chat.**

Trigger esperado vem da skill [`iteracao-prd`](../iteracao-prd/SKILL.md), que ao final de uma iteração estável (PLANO 🟢, suite verde, push em dev OK) oferece 2 opções:

1. Aguardar próximo PRD
2. Promover dev → main

Se opção 2: nova pergunta — "Tem certeza? Vai pra prod (`{{PROD_URL}}`) e afeta usuários reais."

Se confirmar a 2ª vez: ativa esta skill.

**Nunca rodar esta skill sem essa confirmação dupla.** Mesmo em auto mode.

## Pré-condições (verificar ANTES de qualquer mudança)

1. Branch atual = `dev` e está sync com origin:
   ```bash
   git checkout dev && git pull
   git status   # deve estar limpo
   ```
2. `main` não tem commits que `dev` não tem (sem divergência inesperada):
   ```bash
   git log --oneline main..dev   # commits novos a promover
   git log --oneline dev..main   # deveria ser vazio
   ```
   Se `dev..main` não estiver vazio, **PARE** — alguém pushou direto em main, investigar antes de continuar.
3. Suite E2E verde:
   ```bash
   npm run test:e2e
   npx playwright test --reporter=line
   ```
   Se houver flake/falha, oferecer ao usuário: corrigir agora ou abortar release.
4. Lint, tsc, build:
   ```bash
   npm run lint && npx tsc --noEmit && npm run build
   ```
5. Banco DEV está linkado (não PROD):
   ```bash
   cat supabase/.temp/project-ref   # deve ser {{SUPABASE_DEV_REF}}
   ```
6. Nenhuma chave exposta no código (supabase, API keys, etc.)
7. Nenhum `.env` ou arquivo de credenciais staged.
8. Todas as iterações inclusas têm PLANO marcado 🟢.
9. Nenhum TODO crítico aberto nos arquivos de iteração.
10. Verificar que `docs/projeto/ESTADO_ATUAL.md` reflete o estado atual de DEV.

## Etapa 1 · Consulta Context7 (docs atuais)

Antes de qualquer comando que afete prod, consultar Context7 MCP pra ver se houve mudança nas práticas recomendadas:

```
mcp__context7__query-docs com query "Vercel deploy production rollback rolling"
mcp__context7__query-docs com query "Supabase migration zero downtime production"
```

Aplicar qualquer ajuste relevante (ex: novo flag de CLI, nova convenção de migration). Documentar o que foi consultado em `EXECUCAO.md` do release.

Se Context7 indisponível: seguir com checklist in-line desta skill (versão freezada).

## Etapa 2 · Identificar o que vai pra prod

```bash
# Commits novos
git log --oneline main..dev

# Migrations novas (compare com supabase migration list contra PROD após linkar)
ls supabase/migrations/   # local
supabase link --project-ref {{SUPABASE_PROD_REF}}   # PROD temporariamente
supabase migration list --linked   # vê o que já foi aplicado em PROD
supabase link --project-ref {{SUPABASE_DEV_REF}}   # volta pra DEV
```

Diff = migrations a aplicar em PROD nesta release.

```bash
# Edge functions novas
ls supabase/functions/
# Compare com Supabase Dashboard ou via CLI:
supabase functions list --project-ref {{SUPABASE_PROD_REF}}   # PROD
# Identifique functions que existem localmente mas não em prod
```

## Etapa 3 · Criar pasta do release

Numeração: incrementar N olhando `docs/pr_main/` ordenado por nome (release-1 hoje, release-2 amanhã, etc).

```bash
RELEASE_DIR=docs/pr_main/$(date +%Y-%m-%d)_release-N
mkdir -p $RELEASE_DIR
```

Criar 4 arquivos com templates abaixo. Manter EXECUCAO.md vivo durante todo o release.

### `RELEASE_NOTES.md`

```markdown
# Release N · YYYY-MM-DD

> De `main@<hash-antigo>` → `main@<hash-novo>` (após merge)
> Iterações incluídas: <slugs das iterações desde último release>

## Sumário

- <bullet 1>
- <bullet 2>

## Iterações desta release

| Iteração | Slug | Status |
|---|---|---|
| YYYY-MM-DD | slug-da-iteracao | 🟢 |

## PRs mergeados em dev

<gh pr list --base dev --state merged --search "merged:>=YYYY-MM-DD-anterior">

## Migrations novas em PROD

<lista>

## Edge functions deployadas em PROD

<lista>

## Notas pro deploy

- <instrução pós-deploy se houver>
```

### `MIGRATIONS.md`

```markdown
# Migrations a aplicar em PROD

## Lista (ordem cronológica do timestamp)

| # | Arquivo | Resumo |
|---|---|---|
| 1 | `<timestamp>_<slug>.sql` | <header da migration> |

## Plano de aplicação

Aplicar **antes** do merge dev→main. Schema novo + código velho deve ser compatível (migrations aditivas).

```bash
supabase link --project-ref {{SUPABASE_PROD_REF}}
# Aplicar todas em sequência (idempotente)
supabase db push --linked
# Verificar:
supabase migration list --linked

# Voltar pra DEV imediatamente:
supabase link --project-ref {{SUPABASE_DEV_REF}}
```

## Rollback (se necessário)

Cada migration tem comando reverso documentado abaixo. Em geral é DROP do que foi criado.
```

### `CHECKLIST.md`

```markdown
# Checklist do release N

## Pré-release
- [ ] Suite E2E verde em DEV
- [ ] lint / tsc / build verdes
- [ ] dev sincronizado com origin
- [ ] main sem commits que dev não tem
- [ ] Context7 consultado pra docs atuais

## Aplicação em PROD
- [ ] Migrations novas listadas em MIGRATIONS.md
- [ ] Migrations aplicadas em PROD via `supabase db push --linked` (com PROD linkado)
- [ ] Edge functions novas deployadas em PROD
- [ ] Reverteu link pra DEV após operações em PROD

## Merge
- [ ] PR `dev → main` aberto com RELEASE_NOTES no body
- [ ] PR mergeado (squash) pelo usuário no GitHub
- [ ] Vercel detectou push em main e iniciou build

## Pós-deploy
- [ ] `{{PROD_URL}}` retorna 200 (curl ou via browser)
- [ ] Login com papel primário funciona em prod
- [ ] Login com papel secundário funciona em prod
- [ ] Smoke manual de fluxo crítico

## Documentação
- [ ] `docs/projeto/ESTADO_ATUAL.md` atualizado (release date, hash novo, migrations)
- [ ] Iterações inclusas marcadas com `release-N` no histórico
- [ ] EXECUCAO.md deste release preenchido
```

### `EXECUCAO.md`

Vivo. Cada etapa abaixo deixa entrada com timestamp + comando + resultado.

## Etapa 4 · Migrations em PROD (antes do merge)

**Atenção máxima.** Cada comando aqui escreve em prod. Pré-checks já foram feitos.

```bash
supabase link --project-ref {{SUPABASE_PROD_REF}}   # PROD
cat supabase/.temp/project-ref   # confirma

# Sanity check antes do push
supabase migration list --linked

# Aplicar
supabase db push --linked
```

**Se push falhar**: parar imediatamente, NÃO mergear, investigar. Reverter para DEV link.

```bash
supabase link --project-ref {{SUPABASE_DEV_REF}}   # de volta pra DEV
```

## Etapa 5 · Edge functions em PROD

```bash
# Pra cada function nova ou modificada
supabase functions deploy <nome> --no-verify-jwt --project-ref {{SUPABASE_PROD_REF}}
```

Verificar deploy:
```bash
supabase functions list --project-ref {{SUPABASE_PROD_REF}}
```

## Etapa 6 · PR `dev → main`

```bash
gh pr create \
  --base main \
  --head dev \
  --title "release: $(date +%Y-%m-%d) (release-N)" \
  --body "$(cat docs/pr_main/<release-dir>/RELEASE_NOTES.md)"
```

**O usuário precisa mergear no GitHub.** Skill aguarda confirmação no chat ("mergeei" ou link do merge).
**Nunca fazer o merge automático.** Somente o usuário pode fazer o merge.

Após merge:
```bash
git checkout main && git pull
```

## Etapa 7 · Validar deploy Vercel

Vercel auto-deploya em ~1-3 min após push em main.

```bash
# Aguardar build
sleep 60

# Verificar status
curl -I {{PROD_URL}}
# Espera HTTP/2 200
```

Se retornar erro: investigar nos logs do Vercel Dashboard.

Smoke manual recomendado:
- Login com papel primário em prod
- Verifica rota principal carrega
- Login com papel secundário
- Verifica rota secundária carrega

## Etapa 8 · Atualizar `docs/projeto/ESTADO_ATUAL.md`

```markdown
## Em produção

- **Último commit em main**: `<novo-hash>` (release-N de YYYY-MM-DD)
- **Migrations aplicadas em PROD**: <total novo>
- **Edge functions em PROD**: <lista atualizada>
```

```markdown
## Histórico de releases

| Data | N | Hash | Iterações | Notas |
|---|---|---|---|---|
| YYYY-MM-DD | release-N | abc1234 | <slugs> | <bullet curto> |
```

## Etapa 9 · Voltar linkado a DEV

```bash
supabase link --project-ref {{SUPABASE_DEV_REF}}
cat supabase/.temp/project-ref   # deve ser {{SUPABASE_DEV_REF}} (DEV)
git checkout dev
```

## Etapa 10 · Marcar release como concluído + relatório

1. Marcar todos os checkboxes em `CHECKLIST.md`.
2. Adicionar entry final em `EXECUCAO.md` com:
   - Hash de main pós-merge
   - Tempo total do release
   - Smoke results
3. Entregar relatório consolidado no chat:
   - Release N concluído
   - URL prod respondendo
   - Próxima ação: aguardar próximo PRD

## Anti-patterns

- Aplicar migrations em PROD sem confirmação dupla.
- Mergear `dev → main` sem o usuário fazer o merge no GitHub (não force merge).
- Esquecer de relinkar pra DEV após operações em PROD (próxima sessão pode escrever em prod sem perceber).
- Pular pré-checks (suite, lint, build).
- Editar arquivos do release dossiê depois de fechado — abrir novo release pra ajuste.
- Usar `--no-verify` ou `--force` em comandos git/supabase.

## Recuperação de erros

| Sintoma | Ação |
|---|---|
| `db push` falha em PROD | NÃO mergeia. Investiga migration. Pode requerer migration de fix em DEV antes de re-tentar. |
| Edge function fails to deploy | Verifica `supabase functions list`. Pode requerer `supabase secrets set` antes. |
| PR merge conflict | Rebase `dev` em cima de `main` local, push force-with-lease no PR. Comunica com usuário antes. |
| Vercel build fails | Logs no Dashboard. Pode requerer revert de `main` (`git revert -m 1 <hash>`) — autorização explícita. |
| Site retorna 502/503 após deploy | Pode ser propagação. Aguardar 2-5 min. Se persistir, rollback no Vercel via Dashboard. |

## Convenção de numeração de release

`release-N` por dia: `2026-04-28_release-1`, `2026-04-28_release-2`. Cada dia reinicia. Reduz chance de conflito de nome de pasta.

Pra release total acumulado, manter contador no `ESTADO_ATUAL.md` se desejado.
