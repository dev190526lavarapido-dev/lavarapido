# PRD Vivo — Arvore de Pseudocodigo

`docs/prd-vivo/` espelha o codigo-fonte do projeto. Cada `.md` descreve a logica do arquivo real em pseudocodigo `SE...FACA...ENTAO`, sem sintaxe de linguagem.

## Estrutura

```
docs/prd-vivo/
├── README.md              ← este arquivo
├── _INDICE.md             ← mapa navegavel
├── banco_de_dados.md      ← schema do banco
├── core/                  ← layouts, entrypoints, middleware
├── types/                 ← tipagens
├── lib/                   ← funcoes utilitarias, constantes, validacoes
├── pages/                 ← paginas/rotas
│   └── gestor/            ← area do gestor
├── components/
│   ├── gestor/            ← componentes da area do gestor
│   ├── modals/            ← modais
│   └── shared/            ← componentes compartilhados
└── server/
    ├── actions/           ← server actions (mutations)
    └── queries/           ← server queries (reads)
```

## Como usar

1. **Entender** — abrir o `.md` lado a lado com o arquivo real
2. **Alterar** — modificar o pseudocodigo; a IA reproduz no codigo real
3. **Navegar** — cada arquivo referencia outros `.md` da arvore

## Sincronizacao

Rodar `/prd-vivo` para sincronizar com o codigo atual.
Componentes `ui/` (shadcn) nao sao documentados por serem biblioteca padrao.
