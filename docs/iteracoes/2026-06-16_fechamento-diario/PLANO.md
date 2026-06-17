# Plano: Fechamento diário + consolidado por dia

> Iteração: `2026-06-16_fechamento-diario` · Status: 🟡 código pronto · banco 🔴 bloqueado (DEV inexistente)
> PRD: [PRD.md](PRD.md) · Execução: [EXECUCAO.md](EXECUCAO.md) · ADR: [ADR.md](ADR.md)

## Contexto

Adicionar fechamento de turno diário ao app. Um job pg_cron consolida, à meia-noite de
Brasília, o dia que acabou (total de lavagens, faturamento, novos clientes) numa tabela
de snapshot. O dashboard passa a refletir só o dia corrente (com o fuso de Brasília
corrigido) e uma aba nova mostra o histórico como extrato clicável. Ver [PRD.md](PRD.md).

## Premissas e restrições

- MVP single-tenant (1 loja / 1 gestor), mas a modelagem respeita `user_id` + RLS.
- Brasil sem horário de verão (fixo UTC-3); função usa `America/Sao_Paulo` pra ser
  robusta caso o DST volte.
- Todo trabalho de banco roda **somente em DEV** (`xvwfnldvbxequhabunqi`). PROD só via
  release autorizado.
- Migrations sempre via CLI; nunca editar migration já aplicada.
- Branch `passo-N-slug` a partir de `dev` → PR pra `dev` → squash. Nunca push direto em `main`.

## Fases

### Fase 1 · Banco: snapshot + função + cron

Objetivo: persistir o consolidado diário e agendar o disparo automático.

- **Slice 1.1** · Tabela `fechamentos_diarios` + RLS ✅
  - [x] Task 1.1.1 — Migration `create table fechamentos_diarios` (+ `unique(user_id, data)`)
  - [x] Task 1.1.2 — Índice por `(user_id, data desc)` pra listagem
  - [x] Task 1.1.3 — RLS: só SELECT do dono; sem policy de escrita (só via função SECURITY DEFINER)
- **Slice 1.2** · Função `fechar_dia(p_data date)` + RPC manual ✅
  - [x] Task 1.2.1 — `fechar_dia(date,uuid)` core + `fechar_dia(date)` wrapper do cron; janela via `timezone('America/Sao_Paulo', ...)`, agrega + monta `detalhe` jsonb, upsert
  - [x] Task 1.2.2 — RPC `fechar_dia_atual()` corrigida pra **SECURITY DEFINER** (revisão de permissão); `grant execute` só pra `authenticated`
- **Slice 1.3** · Agendamento pg_cron · 🔴 aplicação bloqueada
  - [x] Task 1.3.1 — Migration `create extension if not exists pg_cron` + `cron.schedule('fechar-dia-diario', '0 3 * * *', ...)`
  - [ ] 🔴 Task 1.3.2 — **BLOQUEADO**: aplicar/validar no DEV (projeto DEV inexistente — NXDOMAIN)

### Fase 2 · Dashboard no fuso de Brasília

Objetivo: corrigir o "hoje" pra fronteira 00:00 Brasília; só os agregados do dia viram.

- **Slice 2.1** · Helper de data + correção do dashboard ✅
  - [x] Task 2.1.1 — Util `src/lib/datas.ts`: `inicioDiaBrasiliaISO()`, `dataBrasilia()`, `formatarDataBR()`, `diaDaSemana()`
  - [x] Task 2.1.2 — `dashboard.ts` usa `inicioDiaBrasiliaISO()`; estado ao vivo (aguardando/lavando) segue sem filtro de dia

### Fase 3 · Aba Fechamentos (histórico + extrato)

Objetivo: extrato clicável por dia com resumo + lista de lavagens; botão manual.

- **Slice 3.1** · Listagem `/gestor/fechamentos` + menu ✅
  - [x] Task 3.1.1 — Query `getFechamentos()`
  - [x] Task 3.1.2 — Página lista (extrato: data, lavagens, faturamento, novos) com link pra `[data]`
  - [x] Task 3.1.3 — Entrada no menu (sidebar "Fechamentos" + bottom-bar "Extrato")
- **Slice 3.2** · Detalhe `/gestor/fechamentos/[data]` ✅
  - [x] Task 3.2.1 — Query `getFechamento(data)`
  - [x] Task 3.2.2 — Página: resumo (StatCards) + lista de lavagens do `detalhe`; estados vazio/não-encontrado
- **Slice 3.3** · Fechamento manual ✅
  - [x] Task 3.3.1 — Server action `fecharDiaAtual` chamando a RPC
  - [x] Task 3.3.2 — Botão "Fechar dia de hoje" + revalidate/refresh

### Fase 4 · Testes + segurança

- **Slice 4.1** · Estático ✅
  - [x] Task 4.1.1 — `tsc --noEmit` + `build` + `lint` verdes
- **Slice 4.2** · E2E (ler skill `e2e-performance` antes) · 🔴 bloqueado
  - [ ] 🔴 Task 4.2.1 — **BLOQUEADO**: precisa de DEV vivo + seeds pra rodar
- **Slice 4.3** · Sentinela de segurança ✅
  - [x] Task 4.3.1 — Revisão estática: **PROSSEGUIR** (achou e corrigiu o bug do SECURITY DEFINER; 2 LOW informativos)

### Fase 5 · Docs + fechamento da iteração ✅

- **Slice 5.1** · Documentação viva
  - [x] Task 5.1.1 — `README.md` + `ESTADO_ATUAL.md` atualizados (rota/tabela/cron + bloqueio)
  - [x] Task 5.1.2 — `ADR.md` (pg_cron + fuso Brasília + snapshot imutável)
  - [x] Task 5.1.3 — EXECUCAO.md + relatório final

## Verificação de conclusão

- [ ] Fechamento automático grava o dia que acabou à meia-noite Brasília
- [ ] Dashboard reflete o dia corrente com fronteira 00:00 Brasília
- [ ] Aba lista dias e extrato abre com totais + lista de lavagens
- [ ] Botão manual fecha/refecha idempotente
- [ ] RLS isola por usuário e bloqueia escrita direta; revisão da sentinela OK
- [ ] tsc / build / lint / E2E verdes
- [ ] EXECUCAO.md e documentação de estado atualizados

## Riscos e decisões pendentes

- **pg_cron no plano Supabase**: a extensão precisa estar disponível/habilitável no
  projeto DEV. Se falhar, fallback é Vercel Cron + API route (mesma função `fechar_dia`
  via RPC). Validar na Task 1.3.2 antes de seguir.
- **Job cron só existe no banco onde foi criado**: ao promover pra PROD, a migration do
  cron precisa rodar no banco PROD também — tratado no release.
- **Detalhe imutável vs. dados vivos**: o `detalhe` jsonb congela a foto do dia no
  momento do fechamento; edições posteriores em lavagens não refletem no extrato (é o
  comportamento desejado pra um "extrato").
