# PRD: Hardening pós-análise de ponta a ponta

> Iteração: `2026-06-02_hardening-pos-analise`
> Origem: análise de ponta a ponta solicitada pelo usuário (saúde geral + segurança + qualidade de código).

## Texto do usuário (literal)

> use a skill, cada erro é uma fase, tudo documentado na iteração, use sentinela em todas as fases
> validando se bate com o plano. ao final rode suite e2e validando todos os fluxos existentes.
> garanta que nao quebrou nada durante as melhorias.
> caso e2e de errado valide porque, e nao faça regressao nas melhorias.

## Interpretação

Iteração de **hardening / correção** que ataca os achados levantados na análise de ponta a ponta
(1 crítico de segurança, 3 altos, 4 médios, ~10 baixos). Regras:

- **Cada achado vira uma fase** própria, documentada nesta pasta. Os achados BAIXO são agrupados
  numa única fase de "polish" (decisão do usuário).
- **`sentinela-seguranca` valida cada fase** contra o plano: aderência ao PLANO, regressões,
  efeitos colaterais, integridade de dados, riscos (HIGH/MED/LOW).
- **Ao final**, rodar a **suite E2E completa** validando todos os fluxos existentes.
- **Zero regressão**: se a E2E falhar, investigar a causa real e corrigir sem desfazer/regredir
  as melhorias só para "fazer passar".
- Tudo em **DEV** (branch `passo-N` → PR `dev`), seguindo o workflow do projeto. **NÃO tocar PROD.**

## Origem dos achados (resumo da análise)

| # | Sev | Achado |
|---|-----|--------|
| 1 | 🔴 CRÍTICO | RLS `using(true)` em `lavagens`/`eventos_lavagem` expõe toda a base via anon key; join público de `clientes`/`veiculos` quebrado; token de 48 bits |
| 2 | 🟠 ALTO | `criarClienteComVeiculo` sem transação → cliente órfão se veículo falha |
| 3 | 🟠 ALTO | `mudarStatus` read-modify-write não atômico → race em cliques duplos |
| 4 | 🟠 ALTO | Evento inicial com `status:'entrada'` inexistente no enum |
| 5 | 🟡 MÉDIO | `prod_setup.sql` sem `drop policy if exists` → setup PROD aborta na 2ª execução |
| 6 | 🟡 MÉDIO | `uploadLogo` sem validar MIME/tamanho + acumula logos órfãs |
| 7 | 🟡 MÉDIO | Lint React Compiler: setState síncrono em effect (`whatsapp-modal.tsx`) |
| 8 | 🟡 MÉDIO | Queries de dashboard/clientes puxam tabela inteira e contam/filtram em JS |
| 9 | 🟢 BAIXO | Conjunto de polish: erros engolidos na UI, Zod inconsistente em `atualizarVeiculo`, duplicação `getConfigLoja`/`getConfigLojaPublica`, ordenação dupla de serviços, casts desnecessários, `formatHM` não usado, docs (`ESTADO_ATUAL.md` placeholders + links quebrados no README) |

## Critérios de aceite

- Todos os achados de escopo corrigidos e validados pela sentinela.
- `npx tsc --noEmit` limpo (0 erros).
- `npm run lint` sem erros.
- Suite E2E completa verde validando os fluxos existentes.
- Documentação de estado do projeto atualizada.
- Nenhuma regressão funcional introduzida.

## Fora de escopo

- Deploy/promoção para PROD (exige skill `promover-dev-main` com dupla confirmação separada).
- Features novas (realtime no acompanhamento, multi-loja, etc.).
- Geração completa de tipos do Supabase (`supabase gen types`) — avaliada como opcional dentro do polish.
