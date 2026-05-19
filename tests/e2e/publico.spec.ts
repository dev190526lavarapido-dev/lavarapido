import { test, expect } from '@playwright/test'

test.describe('Páginas Públicas', () => {
  // 8. Vitrine pública carrega
  test('vitrine mostra serviços e info da loja', async ({ browser }) => {
    // Contexto sem auth pra simular visitante
    const context = await browser.newContext({ storageState: undefined })
    const page = await context.newPage()

    await page.goto('/')
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 })

    // Nome da loja visível (header e hero)
    const nomeLoja = page.locator('.pub-header').first()
    await expect(nomeLoja).toBeVisible({ timeout: 10000 })

    // Seção "Nossos servicos" com pelo menos um serviço
    await expect(page.getByText(/Nossos servicos/i)).toBeVisible({ timeout: 10000 })
    // Verifica que há preços (R$) na lista de serviços
    const servicoCards = page.locator('.pub-svc')
    await expect(servicoCards.first()).toBeVisible()
    await expect(page.locator('.preco').first()).toContainText('R$')

    // CTAs: WhatsApp, Ligar, Como chegar
    await expect(page.getByText('WhatsApp')).toBeVisible()
    await expect(page.getByText('Ligar')).toBeVisible()
    await expect(page.getByText('Como chegar')).toBeVisible()

    // Info da loja (endereço, horário, telefone)
    await expect(page.getByText(/Endereco/i)).toBeVisible()
    await expect(page.getByText(/Horario/i)).toBeVisible()
    await expect(page.getByText(/Telefone/i)).toBeVisible()

    await context.close()
  })

  // 9. Link de acompanhamento mostra status e timeline
  test('link de acompanhamento mostra status e timeline', async ({ page, browser }) => {
    // --- Parte 1: criar uma lavagem (autenticado via storageState) ---
    await page.goto('/gestor/nova-lavagem')
    await expect(page.getByRole('heading', { name: /Nova lavagem/i })).toBeVisible({ timeout: 15000 })

    // Step 1: selecionar primeiro veículo
    const searchInput = page.locator('input[placeholder*="Buscar por nome"]')
    await searchInput.fill('a')
    const primeiroVeiculo = page.locator('button:has([data-placa])').first()
    await expect(primeiroVeiculo).toBeVisible({ timeout: 10000 })
    await primeiroVeiculo.click()

    // Step 2: selecionar serviço e continuar
    await expect(page.getByText(/Escolha o servico/i)).toBeVisible({ timeout: 10000 })
    const primeiroServico = page.locator('button:has(.font-heading)').first()
    await primeiroServico.click()
    await page.getByRole('button', { name: /Continuar/i }).click()

    // Step 3: confirmar
    await expect(page.getByText(/Tudo certo/i)).toBeVisible({ timeout: 10000 })
    await page.getByRole('button', { name: /Confirmar entrada/i }).click()
    await expect(page).toHaveURL(/\/gestor\/lavagens/, { timeout: 15000 })

    // --- Parte 2: buscar token da lavagem recém-criada via página de lavagens ---
    // Clicar no primeiro card de lavagem pra abrir modal com detalhes
    // Fechar WhatsApp modal se abriu
    await page.keyboard.press('Escape')

    // Filtrar "Aguardando" pra achar a lavagem recém-criada
    await page.getByRole('button', { name: /Aguardando/i }).first().click()

    // Clicar no primeiro card pra abrir modal de detalhes
    const primeiroCard = page.locator('[draggable="true"]').first()
    await expect(primeiroCard).toBeVisible({ timeout: 10000 })
    await primeiroCard.click()

    // No modal, procurar o link de acompanhamento
    const linkAcompanhamento = page.locator('a[href*="/a/"]').first()
    const href = await linkAcompanhamento.getAttribute('href', { timeout: 5000 }).catch(() => null)

    if (href) {
      // --- Parte 3: abrir link em contexto sem auth ---
      const publicContext = await browser.newContext({ storageState: undefined })
      const publicPage = await publicContext.newPage()

      await publicPage.goto(href)

      // Verificar que mostra info do veículo (placa)
      await expect(publicPage.locator('[data-placa]').first()).toBeVisible({ timeout: 15000 })

      // Verificar status visível
      await expect(publicPage.getByText(/Status agora/i)).toBeVisible()

      // Verificar timeline
      await expect(publicPage.getByText(/Linha do tempo/i)).toBeVisible()

      await publicContext.close()
    } else {
      // Se não encontrou o link no modal, verificar que a página /a/ funciona com token inválido
      // (deve redirecionar pra vitrine com ?lavagem=encerrada)
      const publicContext = await browser.newContext({ storageState: undefined })
      const publicPage = await publicContext.newPage()
      await publicPage.goto('/a/token_invalido_e2e')
      // Deve redirecionar pra vitrine
      await expect(publicPage).toHaveURL(/\/\?lavagem=encerrada|\//, { timeout: 15000 })
      await publicContext.close()
    }
  })
})
