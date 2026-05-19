# lavarapido — Visão Geral

## O que é
App de gestão de lava-rápido com painel do gestor, página pública, acompanhamento por token e WhatsApp via wa.me.

## Stack
Next.js 16, TypeScript, TailwindCSS v4, shadcn/ui, Supabase (Auth + Storage + Postgres + RLS), Zod, React Hook Form

## Links
- Produção: (pendente deploy)
- Repo: dev190526lavarapido-dev/lavarapido

## Estado atual (MVP)

### Rotas implementadas
| Rota | Tipo | Descrição |
|------|------|-----------|
| `/login` | Auth | Login do gestor via Supabase Auth |
| `/gestor/dashboard` | Gestor | Painel principal com métricas e lavagens do dia |
| `/gestor/lavagens` | Gestor | Listagem e gestão de lavagens |
| `/gestor/nova-lavagem` | Gestor | Criar nova lavagem |
| `/gestor/clientes` | Gestor | Cadastro e listagem de clientes |
| `/gestor/catalogo` | Gestor | Catálogo de serviços de lavagem |
| `/gestor/configuracoes` | Gestor | Configurações da loja |
| `/a/[token]` | Público | Acompanhamento de lavagem por token |

### Banco de dados (Supabase DEV)
- Ref: `xvwfnldvbxequhabunqi`
- 10 migrations aplicadas (configurações, clientes, veículos, serviços, lavagens, eventos, mensagens WhatsApp, triggers, RLS, seed)
- RLS habilitado em todas as tabelas

### PWA
- Manifest configurado (`/manifest.json`)
- Ícone SVG placeholder (`/icon.svg`)
- Meta tags de theme-color e viewport

## Documentos vivos
| Arquivo | Conteúdo |
|---|---|
| ESTADO_ATUAL.md | Estado do projeto, ciclo ativo |
| ARQUITETURA.md | Stack, schema, RPCs, triggers |
| WORKFLOW.md | DEV/PROD, branches, PRs, migrations |
| DECISOES.md | Decisões arquiteturais (ADRs) |
