# Plano: MVP Lava Rápido

> Iteração: `2026-05-19_mvp-lava-rapido` · Status: ✅ concluído
> PRD: [PRD.md](PRD.md) · Execução: [EXECUCAO.md](EXECUCAO.md)

## Contexto

Implementação completa do MVP do app de gestão de lava-rápido, partindo do zero até app funcional. Protótipo de referência em `prototipo/project/`.

## Premissas e restrições

- Supabase DEV ref: `xvwfnldvbxequhabunqi`
- Single-tenant (1 loja) no MVP
- WhatsApp apenas via wa.me
- Testes E2E com Playwright após cada fase + suite completa no final
- Nunca tocar banco PROD ou push pra main sem autorização

## Fases

---

### Fase 1 · Setup & Infra

Objetivo: Projeto Next.js rodando com todas as dependências, design system base, layout shell e Supabase configurado.

- **Slice 1.1** · Inicializar projeto Next.js 16
  - [ ] Task 1.1.1 — Criar projeto com `create-next-app` (TypeScript, TailwindCSS, App Router, src/)
  - [ ] Task 1.1.2 — Instalar dependências: `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `react-hook-form`, `@hookform/resolvers`
  - [ ] Task 1.1.3 — Instalar e configurar shadcn/ui (init + componentes base: Button, Input, Textarea, Dialog, Badge, Card, DropdownMenu, Select, Tabs, Toggle)
  - [ ] Task 1.1.4 — Git init, criar branch `dev`, commit inicial

- **Slice 1.2** · Design system & tokens
  - [ ] Task 1.2.1 — Configurar fonts no layout (Bricolage Grotesque, Geist, Geist Mono via next/font ou Google Fonts)
  - [ ] Task 1.2.2 — Configurar CSS variables no globals.css (todas as cores do protótipo: --bg, --surface, --ink, --brand, --status-*, --radius-*, --shadow-*, --font-*)
  - [ ] Task 1.2.3 — Configurar tema escuro (data-theme="dark") e cor da marca customizável (--brand via CSS variable)
  - [ ] Task 1.2.4 — Componentes base do design system: StatusBadge, PlacaTag, Timeline, MoneyBR

- **Slice 1.3** · Layout shell (gestor)
  - [ ] Task 1.3.1 — Topbar (logo LR, nome da loja, botão vitrine, config, logout)
  - [ ] Task 1.3.2 — Sidebar desktop (nav items: Dashboard, Lavagens, Nova, Clientes, Catálogo, Configurações)
  - [ ] Task 1.3.3 — BottomBar mobile (5 tabs com CTA central "Nova")
  - [ ] Task 1.3.4 — Layout grid responsivo (sidebar desktop ≥900px, bottom bar mobile <900px)

- **Slice 1.4** · Configurar Supabase client
  - [ ] Task 1.4.1 — Criar lib/supabase/client.ts (browser client)
  - [ ] Task 1.4.2 — Criar lib/supabase/server.ts (server client com cookies)
  - [ ] Task 1.4.3 — Criar middleware.ts pra refresh de sessão e proteção de rotas /gestor/*
  - [ ] Task 1.4.4 — Preencher .env.local com SUPABASE_URL e SUPABASE_ANON_KEY do DEV
  - [ ] Task 1.4.5 — Criar .env.example (sem valores reais)

---

### Fase 2 · Banco de dados & Auth

Objetivo: Todas as tabelas criadas com RLS, auth funcionando, login operacional.

- **Slice 2.1** · Migrations — tabelas core
  - [ ] Task 2.1.1 — Migration: `configuracoes_loja` (id, user_id, nome_loja, descricao, telefone, whatsapp, endereco_texto, maps_url, horario_funcionamento, instagram_url, mensagem_whatsapp_padrao, logo_url, tema, cor_primaria, mensagens_etapas JSONB, created_at, updated_at)
  - [ ] Task 2.1.2 — Migration: `clientes` (id, user_id, nome, whatsapp, created_at, updated_at)
  - [ ] Task 2.1.3 — Migration: `veiculos` (id, user_id, cliente_id FK, placa, modelo, cor, created_at, updated_at)
  - [ ] Task 2.1.4 — Migration: `servicos_lavagem` (id, user_id, nome, descricao, valor numeric, tempo_estimado_minutos int, ativo bool, ordem_exibicao int, created_at, updated_at)

- **Slice 2.2** · Migrations — lavagens & eventos
  - [ ] Task 2.2.1 — Migration: `lavagens` (id, user_id, cliente_id FK, veiculo_id FK, servico_id FK, token_publico unique, status_atual enum, ativa bool, valor numeric, observacao, ocorrencia_descricao, entrada_em timestamp, retirada_em timestamp, created_at, updated_at)
  - [ ] Task 2.2.2 — Migration: `eventos_lavagem` (id, lavagem_id FK, status, descricao, created_at)
  - [ ] Task 2.2.3 — Migration: `mensagens_whatsapp` (id, lavagem_id FK, tipo, mensagem text, link text, created_at)
  - [ ] Task 2.2.4 — Criar enum ou check constraint pra status: aguardando_lavagem, lavando, lavagem_concluida, ocorrencia, retirado

- **Slice 2.3** · RLS policies
  - [ ] Task 2.3.1 — Habilitar RLS em todas as tabelas
  - [ ] Task 2.3.2 — Policies de leitura/escrita pro gestor (auth.uid() = user_id)
  - [ ] Task 2.3.3 — Policy de leitura pública pra lavagens/eventos via token_publico (pra página de acompanhamento)
  - [ ] Task 2.3.4 — Policy de leitura pública pra configuracoes_loja e servicos_lavagem (pra vitrine)

- **Slice 2.4** · Auth & Login
  - [ ] Task 2.4.1 — Tela de login fiel ao protótipo (email + senha + botão "Entrar no painel" + link vitrine)
  - [ ] Task 2.4.2 — Server action de login com Supabase Auth
  - [ ] Task 2.4.3 — Server action de logout
  - [ ] Task 2.4.4 — Middleware: redireciona /gestor/* pra /login se não autenticado; redireciona /login pra /gestor/dashboard se já autenticado

- **Slice 2.5** · Seed de dados iniciais
  - [ ] Task 2.5.1 — Script/migration de seed: criar config_loja padrão, serviços de exemplo (os 7 do protótipo)
  - [ ] Task 2.5.2 — Criar usuário de teste no Supabase Auth (via dashboard ou script)

- **Slice 2.6** · E2E: Setup Playwright + Auth
  - [ ] Task 2.6.1 — Instalar e configurar Playwright (playwright.config.ts, storageState pra auth)
  - [ ] Task 2.6.2 — Spec: login com credenciais válidas → redireciona pra dashboard
  - [ ] Task 2.6.3 — Spec: acesso a /gestor/* sem auth → redireciona pra login
  - [ ] Task 2.6.4 — Rodar specs da fase e verificar que passam

---

### Fase 3 · Camada de dados (Server Actions & Queries)

Objetivo: Todas as operações de CRUD e consultas prontas pra consumo pelas telas.

- **Slice 3.1** · Schemas Zod + types
  - [ ] Task 3.1.1 — Schemas Zod pra todas as entidades (cliente, veiculo, servico, lavagem, config_loja)
  - [ ] Task 3.1.2 — Types TypeScript derivados dos schemas (inferência Zod)
  - [ ] Task 3.1.3 — Constantes: STATUS_META (label, icon, cor), allowed transitions, default templates WhatsApp

- **Slice 3.2** · Server queries (leitura)
  - [ ] Task 3.2.1 — Queries: dashboard stats (contagens por status, faturamento do dia)
  - [ ] Task 3.2.2 — Queries: lavagens (todas, ativas, por status, com joins de cliente/veículo/serviço)
  - [ ] Task 3.2.3 — Queries: clientes (lista com veículos e contagem de lavagens), veículos por cliente
  - [ ] Task 3.2.4 — Queries: serviços (lista ordenada), config_loja
  - [ ] Task 3.2.5 — Queries públicas: lavagem por token (com eventos), config_loja pública, serviços ativos

- **Slice 3.3** · Server actions (escrita)
  - [ ] Task 3.3.1 — Actions: criar/editar cliente, criar/editar veículo
  - [ ] Task 3.3.2 — Actions: criar lavagem (gera token, cria eventos iniciais), mudar status (cria evento)
  - [ ] Task 3.3.3 — Actions: registrar ocorrência (muda status + cria evento com descrição)
  - [ ] Task 3.3.4 — Actions: CRUD serviço (criar, editar, toggle ativo)
  - [ ] Task 3.3.5 — Actions: atualizar config_loja (dados, aparência, mensagens_etapas)
  - [ ] Task 3.3.6 — Actions: registrar mensagem whatsapp (log)

---

### Fase 4 · Dashboard & Lavagens (Kanban)

Objetivo: As duas telas principais do gestor funcionando.

- **Slice 4.1** · Dashboard
  - [ ] Task 4.1.1 — Stats grid: 8 cards (entradas, aguardando, lavando, concluídas, retirados, ocorrências, faturamento previsto, dinheiro recebido)
  - [ ] Task 4.1.2 — Lista "Lavagens ativas agora" (top 5, cada item com placa, nome, serviço, status badge)
  - [ ] Task 4.1.3 — Ações: botão "Nova lavagem", link "Ver tudo" pra /gestor/lavagens
  - [ ] Task 4.1.4 — Saudação dinâmica (bom dia/tarde/noite)

- **Slice 4.2** · Kanban de lavagens
  - [ ] Task 4.2.1 — 5 colunas (aguardando, lavando, concluída, ocorrência, retirado) com contadores
  - [ ] Task 4.2.2 — Cards de lavagem: placa, nome, serviço, valor, hora entrada, ações (avançar, ocorrência, WhatsApp)
  - [ ] Task 4.2.3 — Drag & drop entre colunas (desktop) com validação de transições permitidas
  - [ ] Task 4.2.4 — Busca por placa/cliente/modelo
  - [ ] Task 4.2.5 — Filter chips por status (todos, aguardando, lavando, etc.) — mobile mostra coluna única quando filtro ativo

- **Slice 4.E2E** · E2E: Dashboard & Lavagens
  - [ ] Task 4.E2E.1 — Spec: dashboard carrega, mostra stats e lista de lavagens ativas
  - [ ] Task 4.E2E.2 — Spec: kanban mostra 5 colunas com cards corretos
  - [ ] Task 4.E2E.3 — Spec: mudar status de uma lavagem via botão (avançar)
  - [ ] Task 4.E2E.4 — Spec: busca filtra lavagens por placa/nome
  - [ ] Task 4.E2E.5 — Validação visual: screenshot dashboard e kanban vs protótipo
  - [ ] Task 4.E2E.6 — Rodar specs da fase e verificar que passam

- **Slice 4.3** · Modal Detalhe da Lavagem
  - [ ] Task 4.3.1 — Info: placa (big), cliente (nome + whatsapp), veículo (modelo + cor), serviço (nome + desc), valor, observação
  - [ ] Task 4.3.2 — Status badge + hora de entrada
  - [ ] Task 4.3.3 — Ações contextuais por status (avançar, voltar, ocorrência, retirar) — conforme protótipo
  - [ ] Task 4.3.4 — Botões: WhatsApp, copiar link público, abrir como cliente
  - [ ] Task 4.3.5 — Timeline completa de eventos

---

### Fase 5 · Nova Lavagem, Clientes & Catálogo

Objetivo: CRUD completo das entidades + wizard de nova lavagem.

- **Slice 5.1** · Nova Lavagem (wizard 3 passos)
  - [ ] Task 5.1.1 — Passo 1: busca de cliente (nome, WhatsApp, placa) + seleção de veículo + botão "Cadastrar novo"
  - [ ] Task 5.1.2 — Passo 1 (novo cliente inline): formulário nome + WhatsApp + placa + modelo + cor
  - [ ] Task 5.1.3 — Passo 2: lista de serviços ativos com seleção (nome, desc, tempo, valor)
  - [ ] Task 5.1.4 — Passo 3: resumo (cliente, WhatsApp, veículo, serviço, valor) + campo observação + botão confirmar
  - [ ] Task 5.1.5 — Ao confirmar: cria lavagem → navega pra lavagens → abre WhatsApp modal com mensagem de entrada

- **Slice 5.2** · Clientes
  - [ ] Task 5.2.1 — Lista de clientes: avatar (iniciais coloridas), nome, WhatsApp, placas, contagem de lavagens
  - [ ] Task 5.2.2 — Busca por nome, placa ou WhatsApp
  - [ ] Task 5.2.3 — Modal detalhe: info do cliente, WhatsApp button, lista de veículos, histórico de lavagens
  - [ ] Task 5.2.4 — Modal novo cliente: nome + WhatsApp + veículo (placa, modelo, cor)

- **Slice 5.3** · Catálogo de serviços
  - [ ] Task 5.3.1 — Lista: ícone, nome, descrição, tempo estimado, valor, toggle ativo/inativo, botão editar
  - [ ] Task 5.3.2 — Modal criar/editar serviço: nome, descrição, valor, tempo estimado, ativo toggle

- **Slice 5.E2E** · E2E: Nova Lavagem, Clientes & Catálogo
  - [ ] Task 5.E2E.1 — Spec: wizard nova lavagem (buscar cliente → selecionar serviço → confirmar → cria lavagem)
  - [ ] Task 5.E2E.2 — Spec: cadastrar cliente novo inline no wizard
  - [ ] Task 5.E2E.3 — Spec: lista de clientes carrega, busca funciona, modal detalhe abre
  - [ ] Task 5.E2E.4 — Spec: catálogo lista serviços, toggle ativo/inativo, criar/editar serviço
  - [ ] Task 5.E2E.5 — Validação visual: screenshots das telas vs protótipo
  - [ ] Task 5.E2E.6 — Rodar specs da fase e verificar que passam

---

### Fase 6 · WhatsApp & Ocorrência

Objetivo: Modais de WhatsApp e ocorrência funcionando em todos os contextos.

- **Slice 6.1** · Lógica de mensagens WhatsApp
  - [ ] Task 6.1.1 — Função buildWaMessage: monta mensagem com header fixo + body por etapa + footer fixo
  - [ ] Task 6.1.2 — Função fillTemplate: substitui variáveis ({{placa}}, {{servico}}, {{descricao}}, etc.)
  - [ ] Task 6.1.3 — Função waLink: gera URL wa.me com número + mensagem encodada
  - [ ] Task 6.1.4 — Templates padrão por etapa (entrada, lavando, concluída, retirado, ocorrência, aguardando)

- **Slice 6.2** · Modal WhatsApp
  - [ ] Task 6.2.1 — Header: avatar + nome + WhatsApp do cliente
  - [ ] Task 6.2.2 — Chips de preset (Entrada, Lavando, Pronto, Fila, Ocorrência, Retirado, Outro)
  - [ ] Task 6.2.3 — Preview estilo WhatsApp (wa-chat + wa-bubble com horário)
  - [ ] Task 6.2.4 — Textarea editável pra ajustar mensagem
  - [ ] Task 6.2.5 — Botões: "Pular aviso" + "Abrir no WhatsApp" (abre wa.me em nova aba)
  - [ ] Task 6.2.6 — Integrar: abrir modal automaticamente após mudança de status

- **Slice 6.3** · Modal Ocorrência
  - [ ] Task 6.3.1 — Textarea com descrição da ocorrência
  - [ ] Task 6.3.2 — Botões de sugestão rápida (4 opções pré-definidas)
  - [ ] Task 6.3.3 — Ao salvar: muda status pra ocorrência + cria evento + abre WhatsApp modal

- **Slice 6.E2E** · E2E: WhatsApp & Ocorrência
  - [ ] Task 6.E2E.1 — Spec: modal WhatsApp abre com mensagem correta por tipo
  - [ ] Task 6.E2E.2 — Spec: troca de preset atualiza mensagem e preview
  - [ ] Task 6.E2E.3 — Spec: modal ocorrência salva descrição e muda status
  - [ ] Task 6.E2E.4 — Validação visual: screenshots dos modais vs protótipo
  - [ ] Task 6.E2E.5 — Rodar specs da fase e verificar que passam

---

### Fase 7 · Configurações

Objetivo: Tela de configurações completa com persistência.

- **Slice 7.1** · Card Aparência
  - [ ] Task 7.1.1 — Seletor de tema (Claro / Escuro) com preview visual
  - [ ] Task 7.1.2 — Seletor de cor da marca: 7 presets + color picker customizado + input hex
  - [ ] Task 7.1.3 — Preview ao vivo (botão primário, secundário, badges, placa)
  - [ ] Task 7.1.4 — Aplicar tema e cor em tempo real (CSS variables no :root)

- **Slice 7.2** · Cards Identidade e Contato
  - [ ] Task 7.2.1 — Upload de logo (Supabase Storage) com preview
  - [ ] Task 7.2.2 — Campos: nome da loja, descrição
  - [ ] Task 7.2.3 — Campos: telefone, WhatsApp, endereço, link Maps, horário, Instagram
  - [ ] Task 7.2.4 — Mensagem padrão da vitrine (WhatsApp)
  - [ ] Task 7.2.5 — Botão "Salvar alterações" com feedback visual

- **Slice 7.3** · Card Mensagens por etapa
  - [ ] Task 7.3.1 — Tabs por etapa (Entrada, Lavando, Pronto, Retirado, Ocorrência, Pra fila)
  - [ ] Task 7.3.2 — Header fixo (saudação) e footer fixo (link + loja) com visual read-only
  - [ ] Task 7.3.3 — Textarea editável pro body da etapa + botões de inserir variáveis
  - [ ] Task 7.3.4 — Preview WhatsApp ao vivo (chat bubble com dados mock)
  - [ ] Task 7.3.5 — Botão resetar pra template padrão

- **Slice 7.E2E** · E2E: Configurações
  - [ ] Task 7.E2E.1 — Spec: alterar tema claro/escuro aplica em tempo real
  - [ ] Task 7.E2E.2 — Spec: alterar cor da marca atualiza --brand
  - [ ] Task 7.E2E.3 — Spec: editar dados da loja e salvar
  - [ ] Task 7.E2E.4 — Spec: editar mensagem de etapa e ver preview atualizado
  - [ ] Task 7.E2E.5 — Validação visual: screenshots vs protótipo
  - [ ] Task 7.E2E.6 — Rodar specs da fase e verificar que passam

---

### Fase 8 · Páginas Públicas

Objetivo: Vitrine e acompanhamento funcionando sem auth.

- **Slice 8.1** · Vitrine Pública (`/`)
  - [ ] Task 8.1.1 — Header: logo + nome + horário + link "Sou da equipe"
  - [ ] Task 8.1.2 — Hero: nome grande, descrição, CTAs (WhatsApp, Ligar, Como chegar)
  - [ ] Task 8.1.3 — Grid de serviços ativos (nome, desc, tempo, preço)
  - [ ] Task 8.1.4 — Info cards (endereço, horário, telefone, Instagram)
  - [ ] Task 8.1.5 — Footer + banner "lavagem encerrada" (quando vem de token expirado)

- **Slice 8.2** · Acompanhamento (`/a/[token]`)
  - [ ] Task 8.2.1 — Header: logo + nome + "Acompanhamento ao vivo"
  - [ ] Task 8.2.2 — Hero card: saudação, placa (big), modelo, cor, serviço + valor
  - [ ] Task 8.2.3 — Status atual com ícone animado (pulse) + descrição de ocorrência se houver
  - [ ] Task 8.2.4 — Timeline de eventos com marcadores coloridos por status
  - [ ] Task 8.2.5 — CTAs: WhatsApp, Ligar, Como chegar
  - [ ] Task 8.2.6 — Redirect pra vitrine quando lavagem é encerrada (com param ?lavagem=encerrada)

- **Slice 8.E2E** · E2E: Páginas Públicas
  - [ ] Task 8.E2E.1 — Spec: vitrine carrega sem auth, mostra serviços e info da loja
  - [ ] Task 8.E2E.2 — Spec: acompanhamento com token válido mostra status e timeline
  - [ ] Task 8.E2E.3 — Spec: token inválido/expirado redireciona pra vitrine
  - [ ] Task 8.E2E.4 — Validação visual: screenshots vitrine e acompanhamento vs protótipo
  - [ ] Task 8.E2E.5 — Rodar specs da fase e verificar que passam

---

### Fase 9 · Polish, PWA & Suite E2E Final

Objetivo: App pronto pra deploy, build verde, responsivo, PWA, suite E2E completa passando.

- **Slice 9.1** · PWA & Meta
  - [ ] Task 9.1.1 — Manifest.json (nome, ícones, theme_color, start_url)
  - [ ] Task 9.1.2 — Meta tags (viewport, theme-color, apple-mobile-web-app-capable)
  - [ ] Task 9.1.3 — Favicon e ícones

- **Slice 9.2** · Ajustes finais
  - [ ] Task 9.2.1 — Preencher CLAUDE.md com placeholders reais (nome, stack, URLs, refs Supabase)
  - [ ] Task 9.2.2 — Atualizar docs/projeto/README.md com estado atual
  - [ ] Task 9.2.3 — Verificar build de produção (`npm run build`)
  - [ ] Task 9.2.4 — Testar responsividade (mobile, tablet, desktop)
  - [ ] Task 9.2.5 — Revisar segurança: RLS, env vars, sem secrets expostos

- **Slice 9.3** · Suite E2E completa
  - [ ] Task 9.3.1 — Rodar suite Playwright completa (todas as specs)
  - [ ] Task 9.3.2 — Corrigir eventuais falhas
  - [ ] Task 9.3.3 — Verificar que suite completa passa em < 5 min

---

## Verificação de conclusão

- [ ] `npm run dev` roda sem erros
- [ ] `npm run build` passa
- [ ] Login funciona com Supabase Auth
- [ ] Todas as 7 telas do gestor implementadas e funcionais
- [ ] Ambas as páginas públicas implementadas
- [ ] Todos os 3 modais implementados
- [ ] Fluxo de status completo com drag & drop
- [ ] WhatsApp via wa.me funciona
- [ ] RLS nas tabelas
- [ ] Design fiel ao protótipo
- [ ] Responsivo (mobile + desktop)
- [ ] EXECUCAO.md preenchido com resultados de todas as Fases
- [ ] Documentação do projeto atualizada

## Riscos e decisões pendentes

- **Supabase keys:** precisamos das chaves ANON e URL do projeto DEV pra configurar .env.local
- **Usuário de teste:** precisa criar um usuário no Supabase Auth (email/senha) pra login funcionar
- **Next.js 16:** confirmar se create-next-app@latest já gera v16 ou se precisa flag específica
- **Logo storage:** bucket público precisa ser criado no Supabase Storage
- **Realtime:** MVP não usa realtime (polling ou refresh manual); considerar pra v2
