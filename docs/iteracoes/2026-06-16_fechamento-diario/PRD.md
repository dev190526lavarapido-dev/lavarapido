# PRD: Fechamento diário + consolidado por dia

> Iteração: `2026-06-16_fechamento-diario`
> Plano: [PLANO.md](PLANO.md) · Execução: [EXECUCAO.md](EXECUCAO.md)

## Pedido do usuário (literal)

> vamos fazer um fechamento simples para o app e um trigger que dispara meia noite
> todo dia consolidando o turno do dia com total de lavagens, faturamento, novos
> clientes cadastrados.
> todo dia meia noite (horario de brasilia) o dashboard zera (mostra dados do dia),
> e o consolidado fica em uma aba dedicada com historico por dia, como um extrato
> clicavel onde abre mais informações salvas do dia.

## Interpretação

App de lava-rápido precisa de um **fechamento de turno diário**:

1. **Consolidação automática à meia-noite (horário de Brasília)** do turno do dia que
   acabou: total de lavagens, faturamento e novos clientes cadastrados.
2. **Dashboard passa a refletir só o dia corrente** — os agregados do dia "zeram" à
   meia-noite de Brasília. (Cards de estado ao vivo — aguardando/lavando — NÃO zeram,
   pois representam o estado atual da operação, não um agregado do dia.)
3. **Aba dedicada de histórico** estilo extrato: lista de dias, cada um clicável,
   abrindo o detalhe salvo daquele dia.

## Decisões tomadas (validadas com o usuário)

| Tema | Escolha |
|------|---------|
| Disparo + armazenamento | Snapshot persistido + **pg_cron** (job no Postgres, 03:00 UTC = 00:00 Brasília) |
| Fechamento manual | **Sim** — botão pra fechar/refechar o dia sob demanda (mesma função do cron, idempotente) |
| Extrato do dia | **Resumo (totais) + lista de lavagens** (cliente, placa, serviço, valor) |

## Achado técnico relevante

O dashboard hoje calcula "hoje" com `new Date()` no fuso do **servidor**
([dashboard.ts:8-10](../../../src/server/queries/dashboard.ts#L8-L10)). Na Vercel o
servidor roda em **UTC**, então atualmente o painel "zera" às 21:00 de Brasília
(meia-noite UTC), não à meia-noite local. Corrigir esse fuso faz parte do escopo —
é pré-requisito pro item 2 do pedido funcionar como descrito.

## Escopo

**Inclui:**
- Tabela `fechamentos_diarios` (por `user_id` + `data`), com RLS.
- Função `fechar_dia(data)` (SECURITY DEFINER, idempotente via upsert).
- Agendamento pg_cron diário + extensão.
- Botão de fechamento/refechamento manual (via RPC pra mesma função).
- Correção do fuso do dashboard (fronteira 00:00 Brasília).
- Aba `/gestor/fechamentos` (lista) + `/gestor/fechamentos/[data]` (extrato).
- Entrada de menu (sidebar + bottom-bar).
- Cobertura E2E + revisão da sentinela de segurança.

**Não inclui (fora de escopo):**
- Multi-loja / multi-tenant (segue MVP single-tenant).
- Edição/estorno de fechamento já gravado (refechar sobrescreve via upsert; sem
  versionamento histórico).
- Relatórios agregados (semana/mês), gráficos, export PDF/CSV.
- Fechamento de caixa por forma de pagamento (não há esse dado modelado hoje).

## Critérios de aceite

- À meia-noite de Brasília, um registro do dia que acabou é gravado automaticamente.
- O dashboard mostra os agregados do dia corrente, virando à meia-noite de Brasília.
- A aba de fechamentos lista os dias e cada dia abre o extrato com totais + lavagens.
- O botão manual fecha/refecha o dia atual de forma idempotente.
- RLS impede um usuário de ler/gravar fechamento de outro; escrita direta na tabela
  é barrada (só via função).
- `tsc`, build, lint e suite E2E verdes.
