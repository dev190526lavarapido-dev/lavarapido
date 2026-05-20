# Execução: MVP Lava Rápido

> Iteração: `2026-05-19_mvp-lava-rapido`
> Plano: [PLANO.md](PLANO.md)
> Status: ✅ Concluído

---

## PRs mergeados

| PR | Título | Branch |
|----|--------|--------|
| #15 | feat: vitrine publica (/) fiel ao prototipo | — |
| #16 | feat: add PWA support, meta tags, and fill project placeholders | — |
| #17 | feat: add E2E specs for main gestor flows and public pages | — |
| #18 | fix: corrige 8 bugs da comparacao prototipo vs projeto | — |
| #19 | fix: auth em server actions + E2E specs 13/13 green | fix-e2e-specs |

---

## Resumo das entregas

### Segurança — Auth em server actions
Todas as server actions agora verificam autenticação (`getUser`) e filtram por `user_id`:
- `criarCliente`, `criarClienteComVeiculo` — INSERT com `user_id`
- `criarVeiculo` — INSERT com `user_id`
- `criarServico` — INSERT com `user_id`
- `criarLavagem` — INSERT com `user_id`
- `atualizarServico`, `toggleServico` — UPDATE com `.eq('user_id')`
- `mudarStatus`, `registrarOcorrencia` — UPDATE com `.eq('user_id')`
- `atualizarConfigLoja`, `atualizarAparencia`, `uploadLogo` — UPDATE com `.eq('user_id')`
- `registrarMensagem` — INSERT com auth check

### E2E — 13/13 testes passando (~1.6min)
- Auth: setup, dashboard auth, redirect sem auth, login com credenciais
- Gestor: cadastrar cliente, cadastrar servico, criar lavagem wizard, fluxo completo de status, dashboard stats, editar config, link acompanhamento, logout
- Publico: vitrine com servicos e info da loja

### Bugs corrigidos
- Hydration race no login (form fazia GET nativo antes do React hidratar)
- WhatsApp modal bloqueando clicks (adicionado handler Escape + helper closeWhatsAppModal)
- `process.env` em `page.evaluate` (browser context nao tem `process`)
- Strict mode violations no dashboard e config (locators ambiguos)
- Vitrine heading (era `<div>`, nao `<h1>`)
- Config save silencioso (faltava `.eq('user_id')` no UPDATE)

### Infra
- Playwright v1.60 configurado com timeouts, screenshots/video on failure, reporters
- `.gitignore` atualizado para arquivos temporarios de teste

---

## Verificações finais

| Check | Resultado |
|-------|-----------|
| `npx tsc --noEmit` | ✅ Zero erros |
| `npm run lint` | ✅ Zero erros |
| `npm run build` | ✅ Build OK |
| `npx playwright test` | ✅ 13/13 green |
| Auth em todas as actions | ✅ Auditado |
| Codigo legado/stale | ✅ Limpo |
