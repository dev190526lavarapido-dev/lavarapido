---
name: iteracao-prd
description: Use quando o usuário entregar um PRD (texto livre, arquivo .md ou pedido de melhoria) e for hora de transformar em plano executável. Cria pasta datada em docs/iteracoes/, gera PRD.md + PLANO.md + EXECUCAO.md, organiza Fases → Slices → Tasks com checkboxes, e exige aprovação explícita antes de executar — mesmo em auto mode. **NUNCA** abrir PR pra `main` sem autorização explícita.
---

# Skill: Iteração PRD → Plano → Execução → Relatório

## Quando usar

Sempre que o usuário trouxer:
- Um PRD escrito (texto livre, arquivo `.md`, anexo)
- Uma melhoria/feature que precisa ser decomposta
- Um pacote de bugs pra atacar
- Qualquer pedido que vá modificar código não-trivial

**Não use** pra ajustes triviais (typo, 1 linha) ou perguntas/análises que não geram código.

## Princípios

1. **Plano explícito antes de executar** — auto mode NÃO autoriza editar código sem aprovação do plano. O usuário deixou isso explícito.
2. **Documentação vive na iteração** — cada ciclo é uma pasta isolada em `docs/iteracoes/YYYY-MM-DD_slug/`.
3. **Estrutura legível pra IA** — qualquer agente que entrar no projeto consegue abrir a documentação do projeto e seguir o trail até a iteração ativa.
4. **Fases → Slices → Tasks** — granularidade que facilita pausas e retomadas.
5. **Atualizar EXECUCAO.md em tempo real** — não esperar o fim pra documentar.

## Fluxo passo-a-passo

### 1. Receber o PRD do usuário

- Se vier em arquivo: leia inteiro, extraia objetivos, escopo, premissas, restrições, critérios de aceite.
- Se vier em texto: copie literal pro `PRD.md` (preservando palavras do usuário) e adicione seção "Interpretação" com sua leitura.
- **Faça perguntas** se houver ambiguidade — não invente requisito.
- **Resuma o PRD em poucas palavras** e pergunte pro usuario se voce entendeu certo o PRD, **NUNCA** pule essa etapa.

### 2. Criar a pasta da iteração

```
docs/iteracoes/YYYY-MM-DD_slug-curto/
├── PRD.md          # o que motivou (texto do usuário + interpretação)
├── PLANO.md        # Fases → Slices → Tasks com checkboxes
└── EXECUCAO.md     # log corrente — atualizado a cada Slice/Task concluída
```

Slug: 2-4 palavras descritivas em kebab-case, ex: `setup-auth-flow`, `refactor-api-layer`, `fix-pagamentos`.

Data: hoje em `YYYY-MM-DD` (UTC ou local — escolha consistente).

### 3. Estruturar o PLANO.md

Template:

```markdown
# Plano: <título da iteração>

> Iteração: `YYYY-MM-DD_slug` · Status: 🟡 em execução / 🟢 concluída / 🔴 abortada
> PRD: [PRD.md](PRD.md) · Execução: [EXECUCAO.md](EXECUCAO.md)

## Contexto

<por que essa iteração existe, o que motivou, link pro PRD>

## Premissas e restrições

- <lista do que foi assumido>
- <restrições do usuário, ex: não tocar prod>

## Fases

### Fase 1 · <nome>

Objetivo: <1 frase>

- **Slice 1.1** · <descrição curta>
  - [ ] Task 1.1.1 — <ação concreta>
  - [ ] Task 1.1.2 — <ação concreta>
- **Slice 1.2** · <descrição curta>
  - [ ] Task 1.2.1 — <ação concreta>

### Fase 2 · <nome>

...

## Verificação de conclusão

- [ ] <critério mensurável 1>
- [ ] <critério mensurável 2>
- [ ] EXECUCAO.md preenchido com resultados de todas as Fases
- [ ] Documentação de estado do projeto atualizada

## Riscos e decisões pendentes

- <ponto a confirmar com usuário antes de executar>
```

**Granularidade** das tasks: cada uma deve poder ser executada em <30 min e ter resultado verificável.
**Precaução**: pesquise a documentação das tecnologias envolvidas antes de montar o plano.

### 4. Apresentar o plano e pedir aprovação

No chat, mande resumo do plano em PT-BR (não copie o markdown inteiro — use bullets curtos). Pergunta explícita do tipo:

> "Posso executar este plano? Diga **'ok'** ou aponte ajustes."

Aguarde resposta. **Não execute** mesmo se auto mode estiver ativo.

### 5. Executar Slice por Slice

**Pra iterações grandes** (>2 Fases ou estimativa >2h), considerar ativar a skill `orquestrador` na fase de execução (se disponível). Ela define o modo "Claude não põe a mão na massa, dispara 1 subagente por Slice e valida cada um antes de seguir". Pra iterações menores, executar direto também é OK.

**Slice que toca testes E2E** (criar/modificar spec, fixture, config de testes) → ler a skill `e2e-performance` antes (se disponível). Princípios de performance + qualidade obrigatórios.

A cada Slice concluído:

1. Marque os checkboxes das tasks naquele slice (`[ ]` → `[x]`).
2. Adicione entrada em `EXECUCAO.md` com:
   - Timestamp
   - Slice executado
   - Comandos rodados (resumo)
   - Arquivos tocados
   - PR criado/mergeado (se houver)
   - Resultado / erros encontrados / decisões tomadas
3. Se houver bloqueio: marque slice como `🔴 bloqueado` no PLANO.md, anote em `EXECUCAO.md` e pergunte ao usuário.

### 6. Workflow PR padrão (cada Slice grande pode virar 1 PR)

Slices que mexem em código vão em branch `passo-N-slug` a partir de `dev`:

```bash
git checkout dev && git pull
git checkout -b passo-N-slice-slug
# trabalhar
git push -u origin passo-N-slice-slug
gh pr create --base dev --head passo-N-slice-slug --title "..." --body "..."
gh pr merge <num> --squash --delete-branch
git checkout dev && git pull
```

Slice de docs ou config pode ir num commit direto em `dev` se for trivial.

**NUNCA** abrir PR pra `main` sem autorização explícita.

### 7. Fechamento da iteração

Quando todas as Fases estiverem concluídas:

1. Marque todos os checkboxes verificados em PLANO.md.
2. Mude status do PLANO.md pra `🟢 concluída`.
3. Atualize a documentação de estado do projeto com:
   - Iteração concluída e o que mudou no sistema
   - Próxima iteração (se houver) ou "aguardando próximo PRD"
4. Se a iteração introduziu decisão arquitetural não-óbvia, documente como ADR (Architecture Decision Record).
5. **Entregue relatório consolidado no chat** ao usuário com:
   - Tabela de Fases x Slices x status
   - PRs criados (números, hashes)
   - Resultado de testes
   - Próximos passos sugeridos

### 8. Oferecer release (após iteração estável)

Se tudo passou e a iteração está realmente estável (suite verde, lint/build verdes, push em `dev` OK), ofereça ao usuário no chat **2 opções claras**:

> "Iteração `<slug>` concluída e estável.
> Posso seguir com:
> 1. **Aguardar próximo PRD** (continuar editando)
> 2. **Promover dev → main** (release pra produção em {{URL_PRODUCAO}})
>
> Qual você prefere?"

#### Se "1. Aguardar próximo PRD"

Skill encerra. Não toca em mais nada. Aguarda usuário trazer próximo pedido.

#### Se "2. Promover dev → main"

**Pergunte de novo (confirmação dupla — precaução):**

> "Tem certeza? Isso aplica migrations no banco PROD, mergeia o código pra main, dispara deploy e afeta usuários reais.
>
> Diga **'sim, releasa'** pra ativar a skill de promoção, ou **'não, espera'** pra abortar."

#### Se confirmar a 2a vez

Ative a skill `promover-dev-main` (se disponível). Ela conduz o release ponta-a-ponta:
- Consulta docs atuais da plataforma de deploy + banco
- Cria dossiê de release
- Aplica migrations em PROD antes do merge
- Abre PR `dev → main`
- Aguarda o usuário mergear
- Valida deploy
- Atualiza documentação de estado
- Volta linkado a DEV

#### Se NAO houver confirmação dupla explícita

Não ativar a skill de release. Mesmo que a iteração esteja perfeita.

**Nunca** assumir que "auto mode" autoriza release. Release é evento explícito e irreversível.

## Anti-patterns

- Executar antes do plano aprovado (mesmo em auto mode).
- Pular o PRD.md quando o pedido foi por chat — sempre captura literal.
- Plano vago tipo "implementar feature X" sem decomposição em tasks.
- Esquecer de atualizar EXECUCAO.md durante execução (leva a perda de trace).
- Promover pra `main` sem autorização — prod auto-deploya direto.
- Criar pastas fora de `docs/iteracoes/` pra novos planos. Sempre datada.

## Exemplo mínimo

PRD: "Adicionar filtro de busca na listagem de itens."

PLANO.md:

```markdown
# Plano: Filtro de busca na listagem

## Fases

### Fase 1 · UI do filtro
- **Slice 1.1** · Input de busca no header
  - [ ] Task 1.1.1 — Adicionar componente de input com state local
  - [ ] Task 1.1.2 — Debounce 200ms via setTimeout ou hook dedicado
- **Slice 1.2** · Filtro client-side
  - [ ] Task 1.2.1 — Memo que filtra lista por campos relevantes
  - [ ] Task 1.2.2 — Empty state quando filtro não retorna nada

### Fase 2 · Spec E2E
- **Slice 2.1** · Cobrir filtro
  - [ ] Task 2.1.1 — Spec E2E validando 3 caminhos (match, sem match, limpar filtro)

## Verificação
- [ ] Lint / build / testes verdes
- [ ] EXECUCAO.md preenchido
- [ ] Documentação de estado atualizada
```

EXECUCAO.md (após Slice 1.1):

```markdown
## 2026-04-28 14:30 — Slice 1.1 concluído

PR #48 (passo-1.1-input-busca) — squash hash `abc1234`.

Arquivos: ListHeader.tsx (+15 linhas)

Notas: usei `useDeferredValue` em vez de setTimeout — reage melhor a digitação rápida.
```
