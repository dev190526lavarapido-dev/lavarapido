# lavarapido — Visão Geral

## O que é
App de gestão de lava-rápido com painel do gestor, página pública, acompanhamento por token e WhatsApp via wa.me.

## Stack
Next.js 16, TypeScript, TailwindCSS v4, shadcn/ui, Supabase (Auth + Storage + Postgres + RLS), Zod, React Hook Form

## Links
- Produção: deploy automático via Vercel a partir de `main`
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
| `/a/[token]` | Público | Acompanhamento de lavagem por token (via RPC segura) |

### Banco de dados (Supabase DEV)
- Ref: `xvwfnldvbxequhabunqi`
- 13 migrations no repositório (12 aplicadas + 1 pendente de aplicação manual no DEV)
- RLS habilitado em todas as tabelas
- RPC pública `get_lavagem_publica` para acesso anônimo seguro

### PWA
- Manifest configurado (`/manifest.json`)
- Ícone SVG placeholder (`/icon.svg`)
- Meta tags de theme-color e viewport

## Documentos vivos
| Arquivo | Conteúdo |
|---------|----------|
| `docs/projeto/README.md` | Este arquivo — visão geral e rotas |
| `docs/projeto/ESTADO_ATUAL.md` | Estado detalhado: ciclo ativo, migrations, releases |
| `docs/prd-vivo/` | Pseudocódigo espelho do código real (por arquivo) |
| `docs/iteracoes/` | Histórico de iterações (PRD + PLANO + EXECUCAO) |
