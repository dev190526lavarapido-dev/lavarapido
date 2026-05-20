# Indice — PRD Vivo

Mapa navegavel de todos os arquivos de pseudocodigo.

---

## Banco de Dados

- [banco_de_dados.md](banco_de_dados.md) — schema completo (tabelas, campos, tipos, FKs)

## Core

- [layout.md](core/layout.md) — RootLayout (fontes, metadata, providers)
- [public-layout.md](core/public-layout.md) — PublicLayout (passthrough)
- [public-page.md](core/public-page.md) — VitrinePage (vitrine publica completa)
- [proxy.md](core/proxy.md) — Middleware de autenticacao (protege /gestor/*)

## Types

- [types.md](types/types.md) — Interfaces: ConfigLoja, Cliente, Veiculo, ServicoLavagem, Lavagem, LavagemComDetalhes, EventoLavagem, MensagemWhatsapp, ClienteComVeiculos

## Lib

- [constants.md](lib/constants.md) — LavagemStatus, STATUS_META, STATUS_TRANSITIONS, DEFAULT_TEMPLATES
- [utils.md](lib/utils.md) — cn (clsx + twMerge)
- [validations.md](lib/validations.md) — Schemas Zod (cliente, veiculo, servico, lavagem, config, login)
- [whatsapp.md](lib/whatsapp.md) — Helpers WhatsApp (waLink, fillTemplate, buildWaMessage, tituloPorTipo, tipoMsgParaStatus)
- [supabase/client.md](lib/supabase/client.md) — createClient (browser)
- [supabase/server.md](lib/supabase/server.md) — createClient (server, cookies)

## Pages

- [acompanhamento.md](pages/acompanhamento.md) — AcompanhamentoPage (pagina publica /a/[token])
- [login.md](pages/login.md) — LoginPage (form + server action)
- [gestor/layout.md](pages/gestor/layout.md) — GestorLayout (grid responsivo, breakpoint min-[900px])
- [gestor/dashboard.md](pages/gestor/dashboard.md) — DashboardPage (8 StatCards + top5 lavagens)
- [gestor/lavagens.md](pages/gestor/lavagens.md) — LavagensPage → LavagensView
- [gestor/nova-lavagem.md](pages/gestor/nova-lavagem.md) — NovaLavagemPage → NovaLavagemWizard
- [gestor/catalogo.md](pages/gestor/catalogo.md) — CatalogoPage → CatalogoView
- [gestor/clientes.md](pages/gestor/clientes.md) — ClientesPage → ClientesView
- [gestor/configuracoes.md](pages/gestor/configuracoes.md) — ConfiguracoesPage → ConfiguracoesView

## Components — Gestor

- [bottom-bar.md](components/gestor/bottom-bar.md) — BottomBar (nav mobile, 5 abas + CTA)
- [catalogo-view.md](components/gestor/catalogo-view.md) — CatalogoView (CRUD servicos, toggle inline)
- [clientes-view.md](components/gestor/clientes-view.md) — ClientesView (lista, busca, detalhe, cadastro)
- [configuracoes-view.md](components/gestor/configuracoes-view.md) — ConfiguracoesView (aparencia, identidade, contato, mensagens)
- [lavagem-card.md](components/gestor/lavagem-card.md) — LavagemCard (card draggable com acoes)
- [lavagens-view.md](components/gestor/lavagens-view.md) — LavagensView (kanban drag&drop, busca, filtros)
- [nova-lavagem-wizard.md](components/gestor/nova-lavagem-wizard.md) — NovaLavagemWizard (3 passos)
- [sidebar.md](components/gestor/sidebar.md) — Sidebar (nav desktop, 5 itens + CTA)
- [stat-card.md](components/gestor/stat-card.md) — StatCard (metrica com 6 variantes)
- [topbar.md](components/gestor/topbar.md) — Topbar (header com nome dinamico da loja, logout)

## Components — Modals

- [lavagem-detalhe.md](components/modals/lavagem-detalhe.md) — LavagemDetalheModal (detalhe + timeline + acoes)
- [ocorrencia-modal.md](components/modals/ocorrencia-modal.md) — OcorrenciaModal (textarea + sugestoes rapidas)
- [whatsapp-modal.md](components/modals/whatsapp-modal.md) — WhatsAppModal (preview mensagem, presets, envio via waLink)

## Components — Shared

- [money.md](components/shared/money.md) — Money / moneyBR (formatacao R$)
- [placa-tag.md](components/shared/placa-tag.md) — PlacaTag (badge de placa)
- [status-badge.md](components/shared/status-badge.md) — StatusBadge (badge colorido por status)
- [timeline.md](components/shared/timeline.md) — Timeline (eventos da lavagem)

## Server — Actions

- [auth.md](server/actions/auth.md) — login, logout
- [clientes.md](server/actions/clientes.md) — criarCliente, criarClienteComVeiculo
- [config.md](server/actions/config.md) — atualizarConfigLoja, atualizarAparencia, uploadLogo
- [lavagens.md](server/actions/lavagens.md) — criarLavagem, mudarStatus, registrarOcorrencia
- [servicos.md](server/actions/servicos.md) — criarServico, atualizarServico, toggleServico
- [veiculos.md](server/actions/veiculos.md) — criarVeiculo
- [whatsapp.md](server/actions/whatsapp.md) — registrarMensagem

## Server — Queries

- [clientes.md](server/queries/clientes.md) — getClientes, getClienteById
- [config.md](server/queries/config.md) — getConfigLoja, getConfigLojaPublica
- [dashboard.md](server/queries/dashboard.md) — getDashboardStats
- [lavagens.md](server/queries/lavagens.md) — getLavagens, getLavagensAtivas, getLavagemById, getEventosLavagem
- [publicas.md](server/queries/publicas.md) — getLavagemPorToken, getServicosPublicos
- [servicos.md](server/queries/servicos.md) — getServicos, getServicosAtivos
