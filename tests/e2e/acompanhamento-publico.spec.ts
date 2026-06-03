import { test, expect, type Page } from '@playwright/test'

/**
 * Cobre o fix critico da Fase 1: a pagina publica /a/[token] precisa mostrar
 * dados do CLIENTE e do VEICULO mesmo para um visitante anonimo.
 *
 * Antes do fix, o join cliente/veiculo era bloqueado por RLS para o role
 * anonimo e esses campos vinham null. Agora os dados vem via RPC
 * `get_lavagem_publica` (SECURITY DEFINER), entao devem aparecer preenchidos.
 *
 * O setup da lavagem (pre-condicao) e feito via wizard autenticado; a
 * VALIDACAO do fix e feita num contexto SEM auth (cliente anonimo de verdade).
 */

/** Fecha o modal de WhatsApp que abre apos a criacao da lavagem */
async function closeWhatsAppModal(page: Page) {
  const waChat = page.locator('.wa-chat')
  const appeared = await waChat
    .waitFor({ state: 'visible', timeout: 8000 })
    .then(() => true)
    .catch(() => false)
  if (!appeared) return
  const overlay = page.locator('div').filter({ has: waChat }).last()
  await overlay.locator('button').first().click()
  await waChat.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})
}

test.describe('Acompanhamento publico (/a/[token])', () => {
  test('mostra cliente e veiculo para visitante anonimo', async ({
    page,
    browser,
  }) => {
    // 1. Pre-condicao: criar lavagem ativa via wizard (autenticado).
    //    Cliente "Marcelo" / "Marquinhos" com veiculo cadastrado no seed.
    await page.goto('/gestor/nova-lavagem')
    await expect(page.locator('h1', { hasText: 'Nova lavagem' })).toBeVisible()

    await page.getByPlaceholder(/Buscar por nome/i).fill('Marcelo')
    await expect(page.getByTestId('veiculo-btn').first()).toBeVisible()
    await page.getByTestId('veiculo-btn').first().click()

    await expect(page.getByText('Escolha o serviço')).toBeVisible()
    await page.getByTestId('servico-btn').first().click()
    await page.getByRole('button', { name: /Continuar/i }).click()

    await expect(page.getByText(/Tudo certo\? Confere os dados/i)).toBeVisible()
    await page.getByRole('button', { name: /Confirmar entrada/i }).click()
    await expect(page).toHaveURL(/\/gestor\/lavagens/)
    await closeWhatsAppModal(page)

    // 2. Obter o link de acompanhamento (/a/[token]) abrindo o detalhe da
    //    lavagem recem-criada no painel autenticado.
    //    Obs: depois do hardening da Fase 1, a tabela `lavagens` nao e mais
    //    legivel pelo role anonimo via REST — o token so e acessivel pelo
    //    gestor (UI/RLS) ou pela RPC SECURITY DEFINER. Por isso pegamos o
    //    href direto do botao "Abrir como cliente" no modal de detalhe.
    await expect(page.locator('h1', { hasText: 'Lavagens' })).toBeVisible()

    // Abrir o detalhe clicando no card da lavagem (onClick do card abre o modal).
    // O card e um div clicavel que contem a PlacaTag ([data-placa]).
    const card = page
      .locator('[data-placa="RXY3A47"]')
      .first()
    await expect(card).toBeVisible()
    await card.click()

    const abrirComoCliente = page.getByRole('link', {
      name: /Abrir como cliente/i,
    })
    await expect(abrirComoCliente).toBeVisible()
    const pubUrl = await abrirComoCliente.getAttribute('href')
    expect(pubUrl, 'href /a/[token] deve existir').toBeTruthy()
    const token = pubUrl!.split('/a/')[1]
    expect(token, 'token deve ser extraido do href').toBeTruthy()

    // 3. Visitar /a/[token] como cliente ANONIMO (sem storageState).
    const anonContext = await browser.newContext({ storageState: undefined })
    const anonPage = await anonContext.newPage()
    await anonPage.goto(`/a/${token}`)

    // 4. Validar o FIX: nome do cliente aparece na saudacao.
    //    "Fala, {primeiroNome}!" — Marcelo e o primeiro nome (Marcelo Andrade no seed).
    await expect(anonPage.getByText(/Fala, Marcelo!/i)).toBeVisible()

    // 5. Validar o FIX: placa do veiculo aparece e nao esta vazia.
    const placaTag = anonPage.locator('[data-placa]').first()
    await expect(placaTag).toBeVisible()
    const placa = await placaTag.getAttribute('data-placa')
    expect(placa?.trim().length ?? 0, 'placa nao pode ser vazia').toBeGreaterThan(0)
    // o conteudo de texto da PlacaTag deve bater com o data-placa (nao vazio)
    await expect(placaTag).toHaveText(placa!.trim())

    // 6. Validar o FIX: modelo do veiculo aparece e nao esta vazio (Honda Civic no seed).
    await expect(anonPage.getByText('Honda Civic')).toBeVisible()

    // 7. Estrutura da pagina publica continua presente.
    await expect(anonPage.getByText(/Status agora/i)).toBeVisible()
    await expect(anonPage.getByText(/Linha do tempo/i)).toBeVisible()

    await anonContext.close()
  })
})
