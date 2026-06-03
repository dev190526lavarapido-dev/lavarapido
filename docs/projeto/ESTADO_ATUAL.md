# Estado Atual — lavarapido

## Em produção
- **Último commit em main**: `ad2a3ac` (feat: tema esmeralda, paletas, logo upload, edicao clientes, deploy prep)
- **Migrations em PROD**: 12 (até `20260520150000_create_storage_bucket_loja.sql`)
- **URL**: Deploy automático via Vercel a partir da branch `main`

## Ciclo ativo
Iteração `2026-06-02_hardening-pos-analise` — **concluída em DEV**, aguardando promoção para `main`.

### O que foi feito nesta iteração
| Achado | Descrição | Status |
|--------|-----------|--------|
| #1 — RLS acompanhamento público | Policies `using(true)` em `lavagens` e `eventos_lavagem` vazavam todas as linhas via anon key. Substituídas por RPC `get_lavagem_publica` com `SECURITY DEFINER`. | Aplicado em DEV (migration pendente em PROD) |
| #2 — Cliente órfão | `criarClienteComVeiculo` criava cliente mesmo quando veículo falhava. Corrigido com transação atômica. | Mergeado |
| #3 — Race de status | `mudarStatus` sobrescrevia status concorrente. Corrigido com compare-and-swap. | Mergeado |
| #4 — EventoStatus tipado | Tipo `EventoStatus` formalizado; marco `'entrada'` incluído na timeline. | Mergeado |
| #5 — uploadLogo | Validação de MIME type e tamanho no servidor; path fixo por loja. | Mergeado |
| #6 — Script prod-setup | Script idempotente; hardening de segurança aplicado. | Mergeado |
| #7 — setState em useEffect | Eliminado padrão proibido no whatsapp-modal. | Mergeado |
| #8 — Performance queries | Contagens e somas movidas para o banco (agregação SQL). | Mergeado |
| #9 — Docs | Placeholders e links quebrados nos docs de projeto corrigidos. | Este commit |

### Migration pendente de aplicação manual no DEV
```
supabase/migrations/20260603010243_harden_acompanhamento_publico.sql
```
Aplicar com:
```bash
supabase db push --linked   # ou via dashboard Supabase DEV
```

## Banco de dados (Supabase DEV)
- **Ref**: `xvwfnldvbxequhabunqi`
- **Migrations**: 13 no repositório (12 aplicadas + 1 pendente de aplicação manual)
- **RLS**: habilitado em todas as tabelas
- **RPC pública**: `get_lavagem_publica(p_token text)` — única rota de acesso anônimo a dados de lavagem

## Histórico de releases
| Data | Branch | Hash | Descrição |
|------|--------|------|-----------|
| 2026-05-20 | main | `ad2a3ac` | Tema esmeralda, paletas, logo upload, edição de clientes, prep deploy |
| 2026-06-02 | dev | (pendente promoção) | Hardening pós-análise (segurança, integridade, performance, polish) |
