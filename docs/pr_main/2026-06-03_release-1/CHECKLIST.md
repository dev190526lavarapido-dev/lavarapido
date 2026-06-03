# Checklist do Release 1 · 2026-06-03

## Pré-release
- [x] Suite E2E verde em DEV (14/14, ~2.1 min)
- [x] lint / tsc / build verdes (lint 0/0 · tsc 0 · build exit 0, 11 rotas)
- [x] dev sincronizado com origin
- [x] main sem commits que dev não tem (`dev..main` vazio)
- [x] Sentinela consolidada → PRONTO
- [ ] Context7 consultado (indisponível nesta sessão — usado checklist freezado da skill)

## Aplicação em PROD
- [x] Migration nova listada em MIGRATIONS.md
- [ ] Migration `20260603010243` aplicada em PROD (manual, SQL Editor) — **usuário**
- [x] Sem edge functions a deployar
- [x] Link Supabase permanece em DEV (não toquei PROD via CLI)

## Merge
- [ ] PR `dev → main` aberto com RELEASE_NOTES no body
- [ ] PR mergeado (squash) pelo **usuário** no GitHub
- [ ] Vercel detectou push em main e iniciou build

## Pós-deploy
- [ ] URL de produção retorna 200
- [ ] Login do gestor funciona em prod
- [ ] Smoke do fluxo crítico (criar lavagem → acompanhamento `/a/[token]` mostra cliente/veículo)

## Documentação
- [ ] `docs/projeto/ESTADO_ATUAL.md` atualizado (release date, hash, migration)
- [ ] EXECUCAO.md deste release preenchido

## Follow-up
- [ ] ⚠️ Rotacionar senha do DEV exposta em chat
