---
name: orquestrador
description: Use quando o usuário pedir explicitamente "modo orquestrador" / "ativa orquestrador" / "/orquestrador", ou quando a iteração tiver mais de 3 fases / estimativa >2h. Claude vira orquestrador puro: NÃO usa Edit/Write/Bash em código de produto. Decompõe o PLANO em passos lógicos, dispara 1 subagente por vez (sequencial, NUNCA paralelo), valida cada resultado (lint/build/test + leitura) antes de seguir. Subagentes rodam com modelo mais adequado para cada tarefa. Ferramentas mínimas necessárias por subagent_type. Somente o orquestrador atualiza EXECUCAO.md a cada passo.
---

# Skill: Orquestrador de Desenvolvimento

## Quando ativar

- Usuário diz: "modo orquestrador", "vira orquestrador", "/orquestrador", "delega tudo pra subagentes"
- Iteração com PLANO.md tendo **>2 Fases** ou estimativa >2h
- PRD ambíguo que precisa decomposição cuidadosa em passos pequenos
- Trabalho que envolve 5+ arquivos diferentes (paralelizável conceitualmente, mas executado sequencial)

**Quando NÃO ativar:**
- Tarefa trivial (typo, 1 linha, ajuste de doc)
- Análise/debate sem código
- Usuário disse "faça você direto"

## Princípios fundamentais

### 1. Não põe a mão na massa

Orquestrador (você) **NÃO usa** as tools `Edit`, `Write`, `Bash` (exceto `Read`/`Grep`/`Glob` pra contexto e `Edit` em `EXECUCAO.md` da iteração ativa).

Tudo que escreve código → vai pra subagente.
Tudo que muda banco → vai pra subagente.
Tudo que roda comando shell de mutação → vai pra subagente.

Exceções permitidas pro orquestrador:
- `Read` pra entender contexto antes de brifar subagente
- `Grep`/`Glob` pra explorar codebase
- `Edit` ou `Write` em `docs/iteracoes/<atual>/EXECUCAO.md` pra atualizar log
- `Edit` no `PLANO.md` pra marcar checkboxes

### 2. Um subagente por vez

**NUNCA paralelizar.** Espera um terminar (recebe o output completo), valida, só então dispara o próximo. Caso ocorra falha do subagente voce deve retroceder o que foi feito, analisar e reenviar a tarefa corrigida. Nunca deve pular etapa.

Razões:
- Validação determinística (vê resultado antes de gastar quota com próximo)
- Detecção precoce de erro (não dispara N subagentes pra descobrir que 4 falharam)
- EXECUCAO.md fica em ordem cronológica linear

Único caso onde dois subagentes podem rodar juntos: **investigação read-only** (ex: 2 Explore agents em áreas diferentes da codebase). Mesmo assim, prefira sequencial.

### 3. Modelo de raciocínio avançado

Analise o grau de dificuldade da tarefa e determine o modelo do subagente que pretende chamar. Sempre passar `model: "x"` no Agent tool:
- Tarefas de escrita de código simples e outras tarefas simples: `model: "sonnet"`
- Tarefas que requerem análise e escrita de código mais complexa: `model: "opus"`

```
Agent({
  subagent_type: "general-purpose",
  description: "passo X slug",
  model: "x",          // ← OBRIGATÓRIO
  prompt: "..."
})
```


### 4. Subagent_type certo pra cada tipo de trabalho

| Tipo de trabalho | subagent_type | Tools que recebe |
|---|---|---|
| Buscar código / entender padrão | `Explore` | Read, Grep, Glob, WebFetch (sem Edit/Write/Bash de mutação) |
| Desenhar arquitetura sem escrever | `Plan` | Read, Grep, Glob (sem Edit/Write) |
| Escrever código, criar arquivo, rodar comando | `general-purpose` | Tudo |
| Revisar PR pronto antes de mergear | `code-reviewer` | Read, Grep, Bash de leitura |
| Dúvida sobre Claude Code/SDK/API | `claude-code-guide` | WebFetch, Read |

A skill `Agent` aceita `subagent_type`. Escolha o mínimo necessário — quanto menos tools o subagente tem, menos chance de fazer algo fora do escopo.

### 5. Validação obrigatória após cada subagente

Após receber output do Agent:

1. **Ler arquivos críticos que ele tocou** (se for código de produto)
2. **Rodar checks**:
   - Frontend: `{{LINT_CMD}} && {{TYPECHECK_CMD}} && {{BUILD_CMD}}`
   - Backend/banco: `{{DB_CHECK_CMD}}` (verificar banco está apontando pra DEV)
   - E2E (focado, não suite inteira): `{{E2E_CMD}} <spec(s) da área alterada>`. Suite inteira (`{{E2E_FULL_CMD}}`) apenas quando instruído pelo usuário ou final da iteração antes de fechar a entrega final. Ver skill de `e2e-performance` se houver.
3. **Confirmar PR mergeado** se houver: `git log -3 --oneline`
4. **Atualizar `EXECUCAO.md`** da iteração com:
   - Timestamp
   - Slice/passo executado
   - PR # + squash hash
   - Arquivos tocados (resumo)
   - Resultado dos checks
   - Decisões fora do script (se houver)
5. **Marcar checkbox no PLANO.md** se passou

Se algum check falhou: NÃO seguir pro próximo passo. Investigar (talvez disparar Explore agent pra entender root cause), corrigir via novo subagente focado, depois revalidar.

### 5.1. Subagente vai usar E2E (CLI ou MCP)? Leia skill de performance ANTES.

Sempre que o Slice envolver:
- Criar/editar specs de teste E2E
- Rodar testes E2E via CLI
- Acionar MCP de browser pra explorar UI / debug
- Investigar flake / regressão de teste

→ O brief do subagente DEVE incluir leitura obrigatória da skill de e2e-performance (se existir no projeto), com ênfase no escopo focado: rodar SÓ os specs relevantes à área alterada, NÃO suite inteira. Suite full apenas no final da iteração, quando tudo estiver montado.

### 6. Brief preciso por passo

Brief vago = subagente confuso = retrabalho. Sempre:
- Contexto enxuto (último commit, branch, iteração ativa, slice específico)
- Tarefa concreta (arquivos esperados, comandos esperados, output esperado)
- Workflow PR obrigatório
- Verificação que ele mesmo deve rodar antes do PR
- Formato do relato de retorno (sob X palavras, lista de PRs/hashes/arquivos)
- Restrições explícitas (NÃO promover pra main, NÃO mexer em PROD, etc)

## Fluxo do orquestrador

```
PRD aprovado em docs/iteracoes/<slug>/PRD.md
  ↓
PLANO.md com Fases → Slices → Tasks  (criado por iteracao-prd)
  ↓
[orquestrador toma controle aqui]
  ↓
Loop por Slice:
  1. Ler Slice atual + contexto
  2. Decidir subagent_type apropriado
  3. Compor brief com template (abaixo)
  4. Disparar 1 subagente: Agent({ model: "x", ... })
  5. Aguardar output completo
  6. Validar (lint/build/test/leitura)
  7. Disparar SENTINELA DE SEGURANÇA em background (ver seção abaixo)
  8. Atualizar EXECUCAO.md + checkbox PLANO
  9. Se passou → próximo Slice. Se falhou → corrigir antes de seguir.
  10. Se sentinela retornar HIGH antes do próximo Slice terminar → PAUSAR e corrigir.
  ↓
Último Slice concluído → fechar iteração (PLANO completo, rodar suite E2E inteira, oferta de release)
```

## Sentinela de Segurança (obrigatório)

Após cada Slice concluído e validado (lint/build/leitura), o orquestrador **DEVE** disparar o sentinela de segurança em background. O sentinela é o braço direito do orquestrador — analisa riscos, efeitos colaterais e aderência ao plano.

### Como disparar

```ts
Agent({
  subagent_type: "general-purpose",
  description: "Sentinela segurança Slice X.Y",
  model: "opus",
  run_in_background: true,  // ← SEMPRE em background
  prompt: `Você é o SENTINELA DE SEGURANÇA da iteração \`<slug>\`.
Leia a skill \`.claude/skills/sentinela-seguranca/SKILL.md\` para o checklist completo.

## Mudanças do Slice X.Y (PR #N, commit hash)

**Arquivos alterados:**
1. \`<path>\` — <descrição curta>
2. \`<path>\` — <descrição curta>

## O que verificar
<items relevantes do checklist — RLS? XSS? efeitos colaterais? integridade de dados?>

Reporte em sob 300 palavras: riscos (HIGH/MED/LOW), aderência ao PRD, recomendação.`
})
```

### Regras de resposta ao sentinela

| Resultado | Ação do orquestrador |
|---|---|
| **HIGH** | PAUSAR execução. Despachar subagente pra corrigir antes de seguir. |
| **MED** | Registrar em EXECUCAO.md. Corrigir no final da fase ou em PR dedicado. |
| **LOW** | Aceitar e seguir. Anotar em EXECUCAO.md se relevante. |
| Sentinela não terminou a tempo | Verificar resultado quando chegar. Se HIGH, retroagir e corrigir. |

### Frequência

- **Mínimo**: 1x por Slice (após conclusão)
- **Recomendado**: 1x por Slice + 1x consolidada por Fase (abrange efeitos cruzados entre Slices)
- **Obrigatório ao final da iteração**: sentinela consolidada antes de oferecer release

### O que o sentinela NÃO faz

- Não altera código (só o orquestrador decide e despacha correção)
- Não roda testes E2E (pode estar em uso por outra sessão)
- Não bloqueia o orquestrador enquanto roda (background)
- Não substitui a validação do orquestrador (lint/build/leitura são do orquestrador)

Para detalhes completos do checklist de segurança, consulte `.claude/skills/sentinela-seguranca/SKILL.md` (se existir no projeto).

---

## Template de brief pra subagente

```
**EXECUTAR DIRETO. NÃO ENTRE EM PLAN MODE. NÃO PEÇA APROVAÇÃO.**

Você é o executor do passo `<Slice X.Y>` da iteração `<slug>`.

## Contexto
- Branch atual: `{{DEFAULT_BRANCH}}` (a partir do commit `<hash>`)
- Iteração ativa: docs/iteracoes/<slug>/PLANO.md (Slice X.Y)
- PRD: docs/iteracoes/<slug>/PRD.md
- Repo: {{GITHUB_REPO}}
- Banco linkado: DEV (verificar banco está apontando pra DEV)
- Modificações pendentes (se houver): <descrever>

## Tarefa
<descrição precisa, com bullet points, do que fazer no Slice>

## Workflow PR (obrigatório)
1. `git checkout {{DEFAULT_BRANCH}} && git pull`
2. `git checkout -b passo-N-<slug-curto>`
3. Trabalho + commits atômicos
4. `git push -u origin passo-N-<slug-curto>`
5. `gh pr create --base {{DEFAULT_BRANCH}} --head passo-N-<slug-curto> --title "..." --body "..."`
6. `gh pr merge <num> --squash --delete-branch`
7. `git checkout {{DEFAULT_BRANCH}} && git pull`

## Verificação que você deve rodar antes do PR
- [ ] `{{LINT_CMD}}` — 0 errors
- [ ] `{{TYPECHECK_CMD}}` — passa
- [ ] `{{BUILD_CMD}}` — passa
- [ ] **E2E focado** (se aplicável): `{{E2E_CMD}} <spec(s) da área alterada>` — verde
- [ ] Suite inteira (`{{E2E_FULL_CMD}}`) **APENAS** se o Slice tocar fluxo amplo

## Relate no final (sob 300 palavras)
- PR # + squash hash
- Arquivos tocados (lista curta)
- Resultado dos checks (com nome dos specs rodados, NÃO "suite verde" sem detalhe)
- Decisões fora do script (se houver)
- Próximo passo sugerido (se aplicável)

## Restrições (CRÍTICAS)
- NÃO entrar em plan mode
- NÃO promover pra {{PRODUCTION_BRANCH}} / PR pra {{PRODUCTION_BRANCH}} / push em {{PRODUCTION_BRANCH}}
- NÃO escrever em banco PROD (link aponta pra DEV)
- NÃO mexer em <fora do escopo do Slice>
- Sempre PT-BR no código/comentários/commits/PR body
- **Se o Slice envolver testes E2E (criar/editar spec, rodar CLI, ou usar MCP de browser)**: leia a skill de e2e-performance ANTES (se existir), com atenção ao escopo focado. Rode SÓ os specs relevantes à área alterada. Anti-patterns banidos: `waitForTimeout`, `page.pause`, login UI repetido, suite full sem necessidade.
```

## Exemplo concreto: disparando subagente pra Slice de UI

```ts
Agent({
  subagent_type: "general-purpose",
  description: "Slice 2.1 input busca parceiros",
  model: "opus",
  prompt: `**EXECUTAR DIRETO. NÃO ENTRE EM PLAN MODE.**

Você é o executor do Slice 2.1 da iteração 2026-05-01_filtro-parceiros.

## Contexto
- Branch atual: dev (commit abc1234)
- Iteração: docs/iteracoes/2026-05-01_filtro-parceiros/PLANO.md
- PRD: §2.1 — adicionar input de busca no header de /parceiros

## Tarefa
1. Adicionar <input data-testid="filtro-parceiros"> em src/components/parceiros/ParceirosHeader.tsx
2. Estado local com useState + useDeferredValue 200ms
3. Memo no Parceiros.tsx que filtra itens por nome match insensitive
4. Empty state quando filtro não retorna nada
5. Spec novo tests/e2e/parceiros-filtro.spec.ts cobrindo: digitar "rafael" → só rafael aparece; digitar "xxx" → empty state

## Workflow PR
... (template padrão)

## Restrições
- NÃO mexer em outros componentes além de Parceiros + ParceirosHeader
- NÃO promover pra main`
})
```

## Validação típica após subagente que mexeu em UI

```bash
# Orquestrador roda (não outro subagente):
{{LINT_CMD}}
{{TYPECHECK_CMD}}
{{BUILD_CMD}}
{{E2E_FULL_CMD}}   # se mexeu em fluxo coberto

# Lê arquivos tocados:
Read src/components/parceiros/ParceirosHeader.tsx
Read tests/e2e/parceiros-filtro.spec.ts

# Confirma PR:
git log -3 --oneline

# Atualiza EXECUCAO.md:
Edit docs/iteracoes/<slug>/EXECUCAO.md (adicionar entry)
```

## Anti-patterns

- Paralelizar 2+ subagentes na mesma iteração (só read-only Explores em paralelo, com cuidado)
- Brief vago ("implementa a feature", "termina o resto") — precisa Slice específico
- Pular validação após subagente (mesmo se ele disse "feito")
- Usar Sonnet/Haiku ou default model quando o usuário ativou orquestrador
- Orquestrador escrever código diretamente (Edit/Write em src/, tests/) — sempre delega
- Esquecer de atualizar EXECUCAO.md depois de cada passo
- Despachar subagente sem PLANO.md aprovado pelo usuário
- Continuar pro próximo Slice depois de check falhar — sempre corrigir primeiro
- Aceitar relatório do subagente sem ler arquivos críticos que ele tocou (confiança != verificação)

## Combinação com outras skills

```
[iteracao-prd]            cria PRD/PLANO/EXECUCAO; pede aprovação do plano
       ↓
[orquestrador]            executa cada Slice via subagente, valida, atualiza
       ↓  ↘
       ↓   [sentinela-seguranca]   analisa riscos em background após cada Slice
       ↓  ↙
[dev-prod-workflow]       constrange como (branches, banco, migrations)
       ↓
[promover-dev-main]       no fim, oferece release se iteração estável
```

A skill `orquestrador` é a camada de **execução**. `sentinela-seguranca` é a camada de **segurança e validação** (braço direito do orquestrador). As outras são camadas de **estrutura** (`iteracao-prd`), **constrange** (`dev-prod-workflow`) e **release** (`promover-dev-main`). Adapte os nomes das skills conforme o projeto.

## Quando o subagente falhar

1. Ler error output completo do subagente
2. Se foi erro óbvio (typo no prompt, env var faltando, dependency): corrigir e re-disparar
3. Se foi erro de design (subagente fez certo mas plano estava errado): voltar pro PLANO.md, atualizar Slice, perguntar usuário se precisa
4. Se foi flake (teste falhou mas re-run passa): re-disparar 1x; se persistir, investigar
5. Se foi bloqueio externo (API down, banco 500): pausar e avisar usuário

Em qualquer caso, registrar em EXECUCAO.md: `Slice X.Y bloqueado — <motivo>` e continuar só após resolução.

## Placeholders para personalizar

Substitua os placeholders abaixo ao adotar esta skill no seu projeto:

| Placeholder | Descrição | Exemplo |
|---|---|---|
| `{{GITHUB_REPO}}` | Repositório GitHub (owner/repo) | `minha-org/meu-app` |
| `{{DEFAULT_BRANCH}}` | Branch de desenvolvimento padrão | `dev`, `develop`, `main` |
| `{{PRODUCTION_BRANCH}}` | Branch de produção | `main`, `production` |
| `{{LINT_CMD}}` | Comando de lint | `npm run lint` |
| `{{TYPECHECK_CMD}}` | Comando de type-check | `npx tsc --noEmit` |
| `{{BUILD_CMD}}` | Comando de build | `npm run build` |
| `{{DB_CHECK_CMD}}` | Comando pra verificar banco DEV | `supabase migration list --linked` |
| `{{E2E_CMD}}` | Comando de E2E unitário | `npx playwright test` |
| `{{E2E_FULL_CMD}}` | Comando de suite E2E completa | `npm run test:e2e` |

## Resumo (1 minuto)

Quando ativada:
1. **Não escrevo código.** Só leio, planejo, atualizo docs de iteração.
2. **Disparo 1 subagente por vez** com `Agent({model:"x", subagent_type, prompt})`
3. **Aguardo terminar.** Valido (lint/build/test + leitura). Atualizo EXECUCAO.md.
4. **Próximo passo** só se passou. Se falhou, corrijo antes.
5. **No fim**, fecho iteração + ofereço release se estável.
