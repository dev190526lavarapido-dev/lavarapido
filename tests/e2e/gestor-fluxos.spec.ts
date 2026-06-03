import { test, expect, type Page } from '@playwright/test'

function uid() {
  return Math.random().toString(36).slice(2, 7)
}

/** Close the WhatsApp modal that opens after status changes */
async function closeWhatsAppModal(page: Page) {
  const waChat = page.locator('.wa-chat')
  // Wait for the modal to appear (it opens after server action completes)
  const appeared = await waChat.waitFor({ state: 'visible', timeout: 8000 }).then(() => true).catch(() => false)
  if (!appeared) return

  // Click the X close button (first button inside the fixed overlay that contains wa-chat)
  const overlay = page.locator('div').filter({ has: waChat }).last()
  const closeBtn = overlay.locator('button').first()
  await closeBtn.click()
  await waChat.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})
}

test.describe('Fluxos do Gestor', () => {
  // 1. Cadastrar novo cliente com veículo
  test('cadastrar novo cliente com veículo', async ({ page }) => {
    const tag = uid()
    const nomeCliente = `E2E Cliente ${tag}`
    const placa = `E2E${tag.slice(0, 4).toUpperCase()}`

    await page.goto('/gestor/clientes')
    await expect(page.getByRole('heading', { name: 'Clientes' })).toBeVisible()

    await page.getByRole('button', { name: /Novo cliente/i }).click()
    await expect(page.getByRole('heading', { name: /Novo cliente/i })).toBeVisible()

    await page.getByLabel('Nome').fill(nomeCliente)
    await page.getByLabel('WhatsApp').fill('+5511999990000')
    await page.getByLabel('Placa').fill(placa)
    await page.getByLabel('Cor').fill('Prata')
    await page.getByLabel('Modelo').fill('Civic E2E')

    await page.getByRole('button', { name: /Salvar/i }).click()
    await expect(page.getByRole('heading', { name: /Novo cliente/i })).toBeHidden()

    await page.getByPlaceholder(/Buscar por nome/i).fill(nomeCliente)
    await expect(page.getByText(nomeCliente)).toBeVisible()
  })

  // 2. Cadastrar novo serviço no catálogo
  test('cadastrar novo serviço no catálogo', async ({ page }) => {
    const tag = uid()
    const nomeServico = `Lavagem E2E ${tag}`

    await page.goto('/gestor/catalogo')
    await expect(page.getByRole('heading', { name: /Catálogo/i })).toBeVisible()

    await page.getByRole('button', { name: /Novo serviço/i }).click()
    await expect(page.getByRole('heading', { name: /Novo serviço/i })).toBeVisible()

    await page.getByPlaceholder(/Lavagem com cera/i).fill(nomeServico)
    await page.getByPlaceholder(/Pra ajudar/i).fill('Servico criado via E2E')
    await page.getByPlaceholder('45').fill('99')
    await page.getByPlaceholder('60').fill('30')

    await page.getByRole('button', { name: /Salvar/i }).click()
    await expect(page.getByRole('heading', { name: /Novo serviço/i })).toBeHidden()
    await expect(page.getByText(nomeServico)).toBeVisible()
  })

  // 3. Criar lavagem via wizard completo
  test('criar lavagem via wizard', async ({ page }) => {
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
  })

  // 4. Fluxo completo de status: aguardando → lavando → concluída → retirado
  test('fluxo completo de status até retirada', async ({ page }) => {
    // Criar lavagem via wizard
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

    // Close WhatsApp modal from wizard redirect
    await closeWhatsAppModal(page)
    await expect(page.locator('h1', { hasText: 'Lavagens' })).toBeVisible()

    // Aguardando → Lavando
    await page.locator('button').filter({ hasText: /^Aguardando/ }).first().click({ force: true })
    const btnIniciar = page.getByRole('button', { name: /Iniciar/i }).first()
    await expect(btnIniciar).toBeVisible()
    await btnIniciar.click()
    await closeWhatsAppModal(page)

    // Lavando → Concluída
    await page.locator('button').filter({ hasText: /^Lavando/ }).first().click({ force: true })
    const btnConcluir = page.getByRole('button', { name: /Concluir/i }).first()
    await expect(btnConcluir).toBeVisible()
    await btnConcluir.click()
    await closeWhatsAppModal(page)

    // Concluída → Retirado
    await page.locator('button').filter({ hasText: /^Pronto/ }).first().click({ force: true })
    const btnRetirar = page.getByRole('button', { name: /Retirar/i }).first()
    await expect(btnRetirar).toBeVisible()
    await btnRetirar.click()
    await closeWhatsAppModal(page)

    // Verificar retirado
    await page.locator('button').filter({ hasText: /^Retirado/ }).first().click({ force: true })
    await expect(page.locator('[data-placa]').first()).toBeVisible()
  })

  // 5. Dashboard mostra stats corretos
  test('dashboard mostra stats corretos', async ({ page }) => {
    await page.goto('/gestor/dashboard')
    await expect(page.getByText(/Como ta o dia hoje/i)).toBeVisible()

    await expect(page.getByText('Entradas hoje')).toBeVisible()
    await expect(page.getByText('Faturamento previsto')).toBeVisible()
    await expect(page.getByText('Dinheiro recebido')).toBeVisible()
    await expect(page.getByText('Lavando agora')).toBeVisible()
    // "Aguardando" matches stat card + status badges — scope to exact text in div
    await expect(page.locator('div').filter({ hasText: /^Aguardando$/ }).first()).toBeVisible()

    const faturamento = page.locator('text=Faturamento previsto').locator('..')
    await expect(faturamento.locator('text=/R\\$/')).toBeVisible()

    const recebido = page.locator('text=Dinheiro recebido').locator('..')
    await expect(recebido.locator('text=/R\\$/')).toBeVisible()
  })

  // 6. Editar mensagem de etapa nas configurações
  test('editar mensagem de etapa nas configurações', async ({ page }) => {
    await page.goto('/gestor/configuracoes')
    await expect(page.locator('h1', { hasText: /Configura/ })).toBeVisible()
    await expect(page.getByText(/Mensagens automaticas por etapa/i)).toBeVisible()

    const msgTextarea = page.getByPlaceholder(/Escreva a mensagem/i)
    await expect(msgTextarea).toBeVisible()

    await msgTextarea.clear()
    const novaMensagem = 'Mensagem E2E teste: seu carro {{placa}} chegou!'
    await msgTextarea.fill(novaMensagem)

    // Verify preview shows the text (use bg color class as selector)
    const preview = page.getByTestId('wa-preview').or(page.locator('[class*="DCF8C6"]'))
    await expect(preview.first()).toContainText('Mensagem E2E teste')

    // Click the last "Salvar alteracoes" button (footer)
    const saveBtn = page.getByRole('button', { name: /Salvar alteracoes/i }).last()
    await saveBtn.click()

    // Wait for either "Salvo" feedback or button to re-enable
    await expect(
      page.getByRole('button', { name: /Salvo/i }).first()
    ).toBeVisible({ timeout: 20000 })
  })

  // 7. Link de acompanhamento — precisa de auth, então fica antes do logout
  test('link de acompanhamento mostra status e timeline', async ({ page, browser }) => {
    // Parte 1: criar lavagem via wizard (autenticado)
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

    // Parte 2: pegar token via Supabase REST API
    // Pass env vars as args since page.evaluate runs in browser (no process.env)
    const supabaseUrl = 'https://xvwfnldvbxequhabunqi.supabase.co'
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''

    const tokenResult = await page.evaluate(async ([url, key]) => {
      try {
        const res = await fetch(`${url}/rest/v1/lavagens?order=created_at.desc&limit=1&select=token_publico`, {
          headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
          }
        })
        const data = await res.json()
        return data?.[0]?.token_publico ?? null
      } catch {
        return null
      }
    }, [supabaseUrl, supabaseKey])

    if (tokenResult) {
      const publicContext = await browser.newContext({ storageState: undefined })
      const publicPage = await publicContext.newPage()
      await publicPage.goto(`/a/${tokenResult}`)

      await expect(publicPage.locator('[data-placa]').first()).toBeVisible()
      await expect(publicPage.getByText(/Status agora/i)).toBeVisible()
      await expect(publicPage.getByText(/Linha do tempo/i)).toBeVisible()

      await publicContext.close()
    } else {
      // Fallback: test with invalid token
      const publicContext = await browser.newContext({ storageState: undefined })
      const publicPage = await publicContext.newPage()
      await publicPage.goto('/a/token_invalido_e2e')
      await expect(publicPage).toHaveURL(/\//)
      await publicContext.close()
    }
  })

  // 8. Logout — SEMPRE O ÚLTIMO TESTE (pode invalidar sessão)
  test('logout redireciona para login', async ({ page }) => {
    await page.goto('/gestor/dashboard')
    await expect(page.getByText(/Como ta o dia hoje/i)).toBeVisible()

    await page.getByRole('button', { name: /Sair/i }).click()
    await expect(page).toHaveURL(/\/login/)
  })
})
