# ADR — Fechamento diário

> Iteração: `2026-06-16_fechamento-diario`

## Contexto
Precisávamos consolidar o turno de cada dia (total de lavagens, faturamento, novos
clientes) automaticamente à meia-noite de Brasília, com histórico imutável por dia.

## Decisões

### 1. Agendamento via `pg_cron` (não Vercel Cron)
Escolhido pelo usuário. O job vive no Postgres e roda independente do app estar no ar.
- **Horário**: `0 3 * * *` (UTC) = 00:00 America/Sao_Paulo. Brasil não tem DST desde 2019.
- **À prova de DST**: o job calcula a data-alvo com `timezone('America/Sao_Paulo', now())::date - 1`,
  então fecha o dia certo mesmo se o horário de verão voltar (no pior caso, dispara 1h
  deslocado, ainda na madrugada do dia novo).
- **Alternativa descartada**: Vercel Cron + API route (mantida como fallback caso o plano
  Supabase não tenha pg_cron — ver risco na PLANO.md).

### 2. Snapshot persistido com `detalhe` imutável (jsonb)
A tabela `fechamentos_diarios` guarda os agregados **e** a lista de lavagens do dia num
campo `jsonb`. Assim o extrato é uma "foto" do dia: edições posteriores em `lavagens` não
alteram o histórico já fechado. Trade-off: duplica dados, mas garante imutabilidade do extrato.

### 3. Escrita só via função `SECURITY DEFINER`
A tabela tem RLS só de `SELECT` (dono). Não há policy de escrita: o único caminho de
gravação é `fechar_dia` (SECURITY DEFINER). A RPC exposta ao gestor (`fechar_dia_atual`)
deriva o usuário de `auth.uid()` e nunca aceita `user_id` por parâmetro — o gestor só
fecha o próprio dia. As sobrecargas de `fechar_dia` não recebem grant para `authenticated`.

### 4. Fuso de Brasília no dashboard
O "hoje" do dashboard passou a ser calculado em `America/Sao_Paulo` (`src/lib/datas.ts`),
corrigindo bug pré-existente em que o painel zerava às 21:00 locais (00:00 UTC no servidor
Vercel). Os cards de **estado ao vivo** (aguardando/lavando) seguem sem filtro de dia —
só os agregados do dia (entradas, faturamento) "viram" à meia-noite.

## Consequências
- Histórico por dia consultável e imutável; consistente entre cron e fechamento manual (upsert).
- Dependência operacional: a migration do cron precisa rodar em cada banco (DEV e PROD).
- Dia atual só aparece no histórico depois de fechado (manual ou pelo cron da meia-noite).
