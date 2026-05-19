# Modelo Harness — Template de Projeto com Claude Code

Template de estrutura de trabalho para projetos com Claude Code.
Replica o modelo de trabalho testado e refinado em produção.

## Como usar

1. Copie esta pasta para a raiz do seu novo projeto
2. Renomeie `modelo-harness/` para `.claude/` (ou mova o conteúdo)
3. Preencha os {{PLACEHOLDERS}} em CLAUDE.md:
   - {{PROJECT_NAME}} — nome do projeto
   - {{PROJECT_DESCRIPTION}} — descrição curta
   - {{STACK_DESCRIPTION}} — stack técnica
   - {{PROD_URL}} — URL de produção
   - {{SUPABASE_DEV_REF}} — ref do projeto Supabase DEV
   - {{SUPABASE_PROD_REF}} — ref do projeto Supabase PROD
   - {{GITHUB_REPO}} — owner/repo no GitHub
   - {{ENV_DEV_FILE}} — nome do env file de DEV (ex: .env.test)
   - {{ENV_PROD_FILE}} — nome do env file de PROD (ex: .env.local)
4. Preencha docs/projeto/README.md com info do projeto
5. Preencha docs/projeto/ESTADO_ATUAL.md com estado inicial
6. Comece a trabalhar com "modo orquestrador" ou envie um PRD

## Skills incluídas

| Skill | Função |
|---|---|
| iteracao-prd | Transforma PRD em plano executável com Fases → Slices → Tasks |
| orquestrador | Claude delega para subagentes, valida cada resultado |
| sentinela-seguranca | Analisa segurança em background após cada Slice |
| dev-prod-workflow | Separa DEV/PROD, workflow de branches e migrations |
| e2e-performance | Práticas para suite E2E rápida e confiável |
| promover-dev-main | Release ponta-a-ponta com confirmação dupla |

## Fluxo de trabalho

1. Usuário traz PRD → `iteracao-prd` decompõe em plano
2. Plano aprovado → `orquestrador` executa Slice por Slice
3. Cada Slice → `sentinela-seguranca` analisa em background
4. Todo código → `dev-prod-workflow` constrains branches/banco
5. Testes E2E → `e2e-performance` garante qualidade
6. Iteração estável → `promover-dev-main` oferece release

## Estrutura

modelo-harness/
├── CLAUDE.md                           ← Regras do projeto (PRINCIPAL)
├── SETUP.md                            ← Este arquivo
├── .claude/
│   └── skills/
│       ├── iteracao-prd/SKILL.md
│       ├── orquestrador/SKILL.md
│       ├── sentinela-seguranca/SKILL.md
│       ├── dev-prod-workflow/SKILL.md
│       ├── e2e-performance/SKILL.md
│       └── promover-dev-main/SKILL.md
└── docs/
    ├── projeto/
    │   ├── README.md
    │   └── ESTADO_ATUAL.md
    └── iteracoes/                      ← Cada iteração cria pasta aqui
