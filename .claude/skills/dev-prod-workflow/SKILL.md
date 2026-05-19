---
name: dev-prod-workflow
description: Use sempre que precisar mexer em banco Supabase (migrations, seeds, queries com escrita), criar branch git, abrir PR, ou rodar testes E2E. Enforça separação DEV vs PROD. DEV ({{SUPABASE_DEV_REF}}, branch dev) recebe tudo; PROD ({{SUPABASE_PROD_REF}}, main, deploy) só recebe promoção autorizada explicitamente.
---

# Skill: Workflow DEV vs PROD

## Princípio fundamental

O projeto tem **dois ambientes Supabase isolados** e **duas branches git** que se espelham:

| | DEV | PROD |
|---|---|---|
| **Supabase Project** | `{{SUPABASE_DEV_REF}}` | `{{SUPABASE_PROD_REF}}` |
| **Env file** | `{{ENV_DEV_FILE}}` | `{{ENV_PROD_FILE}}` |
| **URL** | `https://{{SUPABASE_DEV_REF}}.supabase.co` | `https://{{SUPABASE_PROD_REF}}.supabase.co` |
| **Git branch** | `dev` | `main` |
| **Deploy** | (opcional preview) | `{{PROD_URL}}` (auto) |
| **Dados** | seeds + mocks de teste | usuarios reais |
| **E2E** | sempre roda aqui | NUNCA |

**Regra-ancora**: trabalho normal acontece em DEV. PROD so recebe promocao autorizada.

## Antes de qualquer comando que escreve no banco

1. **Verifique qual projeto esta linkado**:
   ```bash
   cat supabase/.temp/project-ref
   ```
   - `{{SUPABASE_DEV_REF}}` -> DEV (ok pra trabalhar)
   - `{{SUPABASE_PROD_REF}}` -> PROD (PARE -- so com autorizacao explicita)

2. **Verifique qual env esta em uso**:
   - Scripts npm que aceitam `--env-file={{ENV_DEV_FILE}}` devem ser explicitados
   - Edge functions deployadas vao pro projeto linkado

3. **Quando relinkar**:
   ```bash
   supabase link --project-ref {{SUPABASE_DEV_REF}}  # DEV
   ```

## Workflow PR (cada slice/passo da iteracao)

```bash
# Sempre partir de dev atualizado
git checkout dev
git pull origin dev

# Branch da task
git checkout -b passo-N-slug-curto

# Trabalho com commits atomicos
# git add especifico, sem -A indiscriminado

# Push e PR
git push -u origin passo-N-slug-curto
gh pr create \
  --base dev \
  --head passo-N-slug-curto \
  --title "feat(escopo): titulo curto" \
  --body "$(cat <<'EOF'
## Resumo
- Bullet 1
- Bullet 2

## Como testar
1. Passo
2. Passo

## Checklist
- [x] lint / tsc / build verdes
- [x] suite E2E passa (npm run test:e2e)
EOF
)"

# Squash merge (mantem historico linear em dev)
gh pr merge <num> --squash --delete-branch

# Voltar pra dev atualizada
git checkout dev
git pull
```

**Nunca:**
- `git push origin main` direto
- `gh pr create --base main` sem autorizacao explicita do usuario
- Commit direto em `main`
- Force push em `main` ou `dev` (use `git revert`)
- `--no-verify` ou skip de hooks

## Migrations Supabase

### 1. Criar migration

```bash
cd supabase/migrations
# nome: <timestamp UTC>_<slug>.sql
# timestamp: date -u +%Y%m%d%H%M%S
```

Header obrigatorio:

```sql
-- =============================================================
-- <SX> -- <titulo descritivo>
-- =============================================================
-- Iteracao: docs/iteracoes/YYYY-MM-DD_slug
-- PRD ref: (se aplicavel)
```

### 2. Aplicar em DEV (sempre primeiro)

```bash
# verifique que esta linkado a DEV
cat supabase/.temp/project-ref  # deve ser {{SUPABASE_DEV_REF}}

supabase db push --linked
```

Output esperado: `Finished supabase db push.` Se erro, **nao promova** -- corrija a migration primeiro.

### 3. Validar em DEV

- Rodar suite E2E: `npm run test:e2e`
- Se a migration mexe em RPC/trigger usado por specs, garantir que continuam verdes

### 4. Promover pra PROD (so com autorizacao explicita)

```bash
# Pedir confirmacao ao usuario ANTES dessa parte
supabase link --project-ref {{SUPABASE_PROD_REF}}  # PROD
supabase db push --linked
# Voltar pra DEV imediatamente apos
supabase link --project-ref {{SUPABASE_DEV_REF}}
```

Sempre apos promover, atualize o documento de estado do projeto com a migration aplicada em PROD.

### Anti-patterns

- `supabase db reset --linked` -- destroi dados, NUNCA em PROD, raramente em DEV
- Migration sem header
- DDL fora de migration (rodar `psql` direto)
- Modificar migration ja aplicada -- sempre nova migration de fix

## Seeds

```bash
# Placeholder -- adapte aos scripts de seed do seu projeto
# Seeds devem ser IDEMPOTENTES (re-run nao duplica dados)

npm run seed:auth       # cria usuarios de teste
npm run seed:mock       # popula dados ficticios
npm run seed:mock:clean # remove so os mocks
```

Seeds **so rodam contra DEV**. Verifique que o script le `{{ENV_DEV_FILE}}` (ou que o projeto linkado e DEV).

**Convencao**: `{{ENV_PROD_FILE}}` e PROD, `{{ENV_DEV_FILE}}` e DEV. Ajuste scripts pra ler env explicito quando aplicavel.

## Testes E2E

Suite roda contra DEV via `{{ENV_DEV_FILE}}`. Convencoes:

```bash
npm run test:e2e           # full suite, headless
npm run test:e2e:ui        # UI mode (debug visual)
npm run test:e2e:debug     # inspector ligado
npx playwright test --reporter=line  # antes de promover dev -> main
```

**Antes de mergear pra `dev`**: full suite verde.
**Antes de promover `dev -> main`**: `--repeat-each 3` sem flake.

## Promocao dev -> main (release)

So com autorizacao explicita do usuario:

```bash
# Confirmar dev verde
git checkout dev
npm run lint && npm run build
npx playwright test

# Abrir PR de release
gh pr create \
  --base main \
  --head dev \
  --title "release: <data ou tag>" \
  --body "Promove <N> PRs de dev pra prod. Ver docs/iteracoes/* desde ultimo release."

# Usuario revisa e mergeia. Deploy de main acontece automaticamente.
```

Apos merge:
1. Aplicar migrations novas em PROD (com autorizacao explicita)
2. Atualizar documento de estado do projeto (release date, hash, migrations aplicadas)
3. Voltar pra dev pra proxima iteracao

## Quando o usuario diz "rode os testes"

Sempre rode contra **DEV**. Confira:
1. `{{ENV_DEV_FILE}}` aponta pra `{{SUPABASE_DEV_REF}}`
2. Fixture de E2E le `{{ENV_DEV_FILE}}`
3. `npm run test:e2e`

Se algum spec falhar por falta de seed, rode os seeds em DEV e tente de novo.

## Quando o usuario pede pra ver dados em producao

Use **leituras read-only**:
```bash
node --env-file={{ENV_PROD_FILE}} -e "<query supabase-js .from(x).select(...)>"
```

Nunca escreva em PROD sem autorizacao explicita.
