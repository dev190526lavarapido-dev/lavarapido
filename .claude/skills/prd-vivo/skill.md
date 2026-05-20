---
name: prd-vivo
description: Sincroniza a arvore docs/prd-vivo/ (pseudocodigo espelho do codigo real). Chamada manual via "/prd-vivo" ou "atualizar prd-vivo". Le cada arquivo .ts/.tsx do src/, compara com o .md correspondente em docs/prd-vivo/, corrige divergencias. Cria .md pra arquivos novos, remove .md pra arquivos deletados. Atualiza _INDICE.md geral E sub-indices por pasta ao final.
---

# Skill: PRD Vivo — Arvore de Pseudocodigo

## O que e

`docs/prd-vivo/` e uma arvore secundaria que espelha o codigo-fonte do projeto. Cada arquivo `.md` descreve a logica do arquivo real em pseudocodigo no formato SE...FACA...ENTAO, sem sintaxe de linguagem de programacao.

Serve para:
1. Entender — abrir o arquivo real e o .md lado a lado
2. Alterar — modificar o fluxo no pseudocodigo; a IA le a mudanca e reproduz no codigo real
3. Navegar — cada arquivo referencia outros .md da arvore, igual ao codigo real

## Quando ativar

- Usuario diz: "/prd-vivo", "atualizar prd-vivo", "sincronizar pseudocodigo", "atualizar arvore pseudo"
- **NAO** ativar automaticamente. Somente sob demanda explicita.

## Estrutura da arvore

```
docs/prd-vivo/
├── README.md                          ← explica o conceito
├── _INDICE.md                         ← indice geral navegavel
├── banco_de_dados.md                  ← schema completo do banco
├── core/                              ← layouts, entrypoints, middleware
│   └── _INDICE.md                     ← sub-indice da pasta
├── types/                             ← tipagens
│   └── _INDICE.md
├── lib/                               ← funcoes utilitarias, constantes, validacoes
│   ├── _INDICE.md
│   └── supabase/
│       └── _INDICE.md
├── pages/                             ← paginas/rotas
│   ├── _INDICE.md
│   └── gestor/
│       └── _INDICE.md
├── components/                        ← componentes UI
│   ├── _INDICE.md
│   ├── gestor/                        ← componentes da area do gestor
│   │   └── _INDICE.md
│   ├── modals/                        ← modais
│   │   └── _INDICE.md
│   └── shared/                        ← componentes compartilhados
│       └── _INDICE.md
└── server/                            ← logica de servidor
    ├── _INDICE.md
    ├── actions/                       ← server actions (mutations)
    │   └── _INDICE.md
    └── queries/                       ← server queries (reads)
        └── _INDICE.md
```

**REGRA:** Toda pasta dentro de `docs/prd-vivo/` DEVE ter seu proprio `_INDICE.md` com links para os arquivos daquela pasta. Alem disso, existe um `_INDICE.md` geral na raiz que lista TUDO hierarquicamente.

> Componentes `ui/` (shadcn) NAO sao documentados por serem biblioteca padrao.

## Padrao do pseudocodigo

Cada arquivo `.md` segue este formato:

```markdown
# NomeDoArquivo

## NomeDaFuncaoOuComponente

RECEBE: param1 (tipo), param2 (tipo)
ESTADO: campo1 = valor_inicial, campo2 = valor_inicial

SE condicao FACA
  chamar outraFuncao → ver [server/actions/auth.md](../server/actions/auth.md)
  → BD [banco_de_dados.md](../banco_de_dados.md) → nome_tabela
ENTAO retorna resultado
SENAO retorna erro

AO MONTAR FACA
  inscrever no canal realtime

AO DESMONTAR FACA
  cancelar inscricao

RENDERIZA
  SE carregando FACA mostrar spinner
  SENAO FACA mostrar conteudo
```

### Regras do pseudocodigo

1. **Portugues** — todo o pseudocodigo em portugues
2. **Formato** — `SE condição FACA acao ENTAO resultado SENAO alternativa`
3. **Referencias entre arquivos** — `→ ver [stores/auth.md](../stores/auth.md)` (link relativo)
4. **Referencias ao banco** — `→ BD [banco_de_dados.md](../banco_de_dados.md) → tabela_nome` (junto a linha que faz a operacao, nao em bloco separado)
5. **Curto e direto** — sem explicacoes longas, so a logica
6. **Fiel ao real** — toda condicao, toda funcao, todo campo, todo retorno deve existir no codigo real. Nenhuma logica inventada, nenhuma omitida
7. **Ordem** — mesma ordem de operacoes do codigo real
8. **Tipos exportados** — interfaces/types exportados devem ter secao propria listando campos
9. **Estado inicial** — para stores e hooks com estado, listar TODOS os campos do estado inicial

### Para types/

```markdown
# NomeDoArquivo

## NomeTipo
- campo1: tipo (texto, numero, booleano, uuid, etc.)
- campo2: tipo | nulo, opcional
- campo3: "valor1" | "valor2" | "valor3"
- campo_fk: → ver [types/outro.md](./outro.md) → TipoOutro
```

### Para server/actions/

```markdown
# NomeDoArquivo

## nomeFuncao

RECEBE: param1 (tipo), param2 (tipo)

TENTAR
  validar dados com schema → ver [lib/validations.md](../../lib/validations.md)
  inserir/atualizar/deletar → BD [banco_de_dados.md](../../banco_de_dados.md) → tabela_nome
  revalidar path
  retorna sucesso
SE FALHAR
  retorna erro
```

### Para server/queries/

```markdown
# NomeDoArquivo

## nomeFuncao

RECEBE: param1 (tipo), param2 (tipo)

TENTAR
  buscar → BD [banco_de_dados.md](../../banco_de_dados.md) → tabela_nome
  com filtro: campo = valor
  ordenar por: campo
  retorna dados
SE FALHAR
  retorna array vazio / null
```

## Formato dos sub-indices

Cada `_INDICE.md` de pasta segue este formato:

```markdown
# NomeDaPasta — Indice

- [arquivo.md](arquivo.md) — Descricao curta (funcoes/componentes principais)
- [subpasta/](subpasta/_INDICE.md) — Descricao curta (N arquivos)
```

O `_INDICE.md` geral na raiz agrupa por dominio com headers `##`:

```markdown
# Indice — PRD Vivo

## Banco de Dados
- [banco_de_dados.md](banco_de_dados.md) — schema completo

## Core
- [layout.md](core/layout.md) — RootLayout (...)
...
```

## Procedimento de sincronizacao

### Passo 1 — Identificar o que mudou

```bash
# Listar arquivos fonte atuais
find "src" -type f \( -name "*.ts" -o -name "*.tsx" \) | sort

# Listar .md atuais (excluindo meta-arquivos)
find "docs/prd-vivo" -name "*.md" -not -name "README.md" -not -name "_INDICE.md" -not -name "banco_de_dados.md" | sort

# Diff dos ultimos commits (ajustar N conforme necessidade)
git log --oneline -10
git diff --name-only HEAD~N HEAD -- src/
```

### Passo 2 — Disparar validacao em paralelo

Usar subagentes (`model: "sonnet"`) em paralelo, agrupados por dominio:

| Grupo | Pasta prd-vivo | Fonte |
|---|---|---|
| 1 | core/ + pages/ | src/app/**/*.tsx |
| 2 | components/gestor/ | src/components/gestor/*.tsx |
| 3 | components/modals/ + components/shared/ | src/components/modals/*.tsx + src/components/*.tsx |
| 4 | lib/ + types/ | src/lib/**/*.ts |
| 5 | server/actions/ | src/server/actions/*.ts |
| 6 | server/queries/ | src/server/queries/*.ts |

Cada subagente recebe instrucao:

> Para CADA par (arquivo .ts/.tsx real vs arquivo .md):
> 1. Leia o real COMPLETO
> 2. Leia o .md COMPLETO (se nao existir, CRIE do zero)
> 3. Compare: toda funcao, estado, acao, params, condicoes, retorno, subscriptions, selectors, render
> 4. Corrija TODA divergencia com Edit
> 5. Releia para confirmar 100%
> 6. **Atualize o `_INDICE.md` da pasta** se houve criacao/remocao/renomeacao

### Passo 3 — Arquivos novos

Se um arquivo `.ts/.tsx` nao tem `.md` correspondente:
1. Criar o `.md` com pseudocodigo completo
2. Adicionar entrada no `_INDICE.md` da pasta
3. Se faz operacoes no banco, adicionar referencias BD

### Passo 4 — Arquivos removidos

Se um `.md` nao tem `.ts/.tsx` correspondente:
1. Deletar o `.md`
2. Remover entrada do `_INDICE.md` da pasta

### Passo 5 — Atualizar meta-arquivos

1. **banco_de_dados.md** — comparar com tipos do banco (ex: `src/lib/types.ts`)
2. **Todos os `_INDICE.md`** — listar os .md de cada pasta e garantir cobertura 100%
3. **`_INDICE.md` geral** (raiz) — refletir a arvore completa hierarquicamente
4. **README.md** — verificar se estrutura descrita bate com a real

## Mapeamento de caminhos

```
src/app/layout.tsx                     → docs/prd-vivo/core/layout.md
src/app/(public)/layout.tsx            → docs/prd-vivo/core/public-layout.md
src/app/(public)/page.tsx              → docs/prd-vivo/core/public-page.md
src/app/login/page.tsx                 → docs/prd-vivo/pages/login.md
src/app/gestor/layout.tsx              → docs/prd-vivo/pages/gestor/layout.md
src/app/gestor/*/page.tsx              → docs/prd-vivo/pages/gestor/*.md
src/proxy.ts                           → docs/prd-vivo/core/proxy.md
src/lib/types.ts                       → docs/prd-vivo/types/types.md
src/lib/*.ts                           → docs/prd-vivo/lib/*.md
src/lib/supabase/*.ts                  → docs/prd-vivo/lib/supabase/*.md
src/components/gestor/*.tsx             → docs/prd-vivo/components/gestor/*.md
src/components/modals/*.tsx             → docs/prd-vivo/components/modals/*.md
src/components/*.tsx (shared)           → docs/prd-vivo/components/shared/*.md
src/components/ui/*.tsx                 → (NAO documentar — shadcn)
src/server/actions/*.ts                → docs/prd-vivo/server/actions/*.md
src/server/queries/*.ts                → docs/prd-vivo/server/queries/*.md
```

## Criterios de perfeicao

- Todo campo, funcao, condicao, retorno do real deve existir no .md
- Nenhuma logica inventada que nao existe no real
- Nenhuma logica real omitida no .md
- Toda referencia entre arquivos com link relativo correto
- Toda operacao no banco com referencia a banco_de_dados.md
- Ordem das operacoes igual ao codigo real
- Campos opcionais marcados
- Valores de union types listando todos os valores
- Dedup guards, try/catch, optimistic updates, rollbacks documentados
- **Todo `_INDICE.md` de pasta atualizado** com cobertura 100%
- **`_INDICE.md` geral atualizado** com hierarquia completa

## Relatorio ao final

Ao concluir, reportar:

```
## PRD Vivo — Sincronizacao concluida

| Dominio | Arquivos | OK | Corrigidos | Novos | Removidos |
|---|---|---|---|---|---|
| core/ | N | N | N | N | N |
| ... | | | | | |
| TOTAL | N | N | N | N | N |

Divergencias corrigidas:
- arquivo.md — descricao curta da correcao

Arquivos novos criados:
- arquivo.md — criado do zero

Arquivos removidos:
- arquivo.md — fonte deletado

Indices atualizados:
- _INDICE.md (geral)
- pasta/_INDICE.md — motivo
```
