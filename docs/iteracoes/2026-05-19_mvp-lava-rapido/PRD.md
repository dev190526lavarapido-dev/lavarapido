# PRD: MVP Lava Rápido

> Iteração: `2026-05-19_mvp-lava-rapido`
> Autor: Usuário (via chat)
> Data: 2026-05-19

## Motivação

Implementar do zero o MVP completo do app de gestão de lava-rápido, seguindo fielmente o protótipo criado no Claude Design (`prototipo/project/`).

## Texto original do usuário

Stack definida: Next.js 16 + Supabase + Vercel + TailwindCSS + shadcn/ui + Zod + React Hook Form.

Supabase DEV: `xvwfnldvbxequhabunqi` (https://xvwfnldvbxequhabunqi.supabase.co)

### O que precisa ser implementado

#### Setup do projeto
- Inicializar Next.js 16 com TypeScript + TailwindCSS + shadcn/ui
- Configurar Supabase client (auth + storage + database)
- Estrutura de pastas conforme CLAUDE.md
- Git init com branch dev

#### Banco de dados (Supabase Postgres)
Tabelas: usuarios, configuracoes_loja, clientes, veiculos, servicos_lavagem, lavagens, eventos_lavagem, mensagens_whatsapp.
RLS em todas as tabelas. Auth via Supabase Auth.

#### Telas do gestor (autenticado)
1. **Login** — email/senha com Supabase Auth
2. **Dashboard** — stats do dia + lista das 5 lavagens ativas mais recentes
3. **Lavagens** — Kanban 5 colunas + drag & drop + busca + filtros
4. **Nova Lavagem** — wizard 3 passos
5. **Clientes** — lista com busca, modal detalhe
6. **Catálogo** — CRUD de serviços
7. **Configurações** — aparência, identidade, contato, mensagens WhatsApp

#### Telas públicas (sem auth)
8. **Vitrine Pública** (`/`) — institucional
9. **Acompanhamento** (`/a/[token]`) — status ao vivo

#### Modais
10. **Detalhe da Lavagem** — ações contextuais por status
11. **Ocorrência** — descrição + sugestões rápidas
12. **WhatsApp** — preview + abrir wa.me

#### Fluxo de status
entrada → aguardando_lavagem → lavando → lavagem_concluida → retirado (+ocorrência)

#### WhatsApp
- wa.me (não Cloud API)
- Templates por etapa com variáveis dinâmicas
- Preview estilo chat

#### Design
- Fidelidade pixel-perfect ao protótipo
- Fontes: Bricolage Grotesque, Geist, Geist Mono
- Paleta: Sol & Coral (#FF6B47 brand)
- Tema claro/escuro, cor customizável
- Responsivo mobile-first, PWA

## Interpretação

O escopo é a implementação completa do MVP — de setup zero até um app funcional pronto pra deploy na Vercel. O protótipo em `prototipo/project/` serve como referência visual e funcional (11 telas/modais com dados mock, estado, routing, design tokens completos).

O banco é relacional simples (8 tabelas), com separação clara entre lavagem (estado atual) e eventos (histórico/timeline). Auth é só pro gestor (1 usuário no MVP). Páginas públicas não precisam de login.

O WhatsApp no MVP é via wa.me — abre a conversa com mensagem pronta, gestor clica em enviar manualmente.

## Critérios de aceite

- [ ] Projeto roda localmente (`npm run dev`)
- [ ] Build de produção passa (`npm run build`)
- [ ] Login funciona com Supabase Auth
- [ ] Todas as 7 telas do gestor implementadas e funcionais
- [ ] Ambas as páginas públicas implementadas
- [ ] Todos os 3 modais implementados
- [ ] Fluxo de status completo (com drag & drop no Kanban)
- [ ] WhatsApp via wa.me funciona
- [ ] RLS nas tabelas
- [ ] Design fiel ao protótipo
- [ ] Responsivo (mobile + desktop)
- [ ] Pronto pra deploy na Vercel

## Premissas

- Supabase DEV já existe (ref: `xvwfnldvbxequhabunqi`)
- Repo GitHub ainda não existe (será criado durante setup)
- MVP = single-tenant (1 loja), mas sem travar evolução futura pra multi-loja
- Sem WhatsApp Cloud API — só wa.me
- Sem testes E2E nesta iteração (foco é MVP funcional)

## Restrições

- Nunca tocar banco PROD
- Nunca push direto pra main
- Seguir workflow de branches conforme CLAUDE.md
