import { test, expect } from '@playwright/test'

/**
 * Gera string aleatória curta pra evitar colisão entre runs.
 */
function uid() {
  return Math.random().toString(36).slice(2, 7)
}

test.describe('Fluxos do Gestor', () => {
  // 1. Cadastrar novo cliente com veículo
  test('cadastrar novo cliente com veículo', async ({ page }) => {
    const tag = uid()
    const nomeCliente = `E2E Cliente ${tag}`
    const placa = `E2E${tag.slice(0, 4).toUpperCase()}`

    await page.goto('/gestor/clientes')
    await expect(page.getByRole('heading', { name: 'Clientes' })).toBeVisible({ timeout: 15000 })

    // Abrir modal "Novo cliente"
    await page.getByRole('button', { name: /Novo cliente/i }).click()
    await expect(page.getByRole('heading', { name: /Novo cliente/i })).toBeVisible({ timeout: 5000 })

    // Preencher formulário
    await page.getByLabel(/Nome/i).fill(nomeCliente)
    await page.getByLabel(/WhatsApp/i).fill('+55 11 99999-0000')
    await page.getByLabel(/Placa/i).fill(placa)
    await page.getByLabel(/Cor/i).fill('Prata')
    await page.getByLabel(/Modelo/i).fill('Civic E2E')

    // Salvar
    await page.getByRole('button', { name: /Salvar/i }).click()

    // Verificar que modal fechou e cliente aparece na lista
    await expect(page.getByText(nomeCliente)).toBeVisible({ timeout: 15000 })
  })

  // 2. Cadastrar novo serviço no catálogo
  test('cadastrar novo serviço no catálogo', async ({ page }) => {
    const tag = uid()
    const nomeServico = `Lavagem E2E ${tag}`

    await page.goto('/gestor/catalogo')
    await expect(page.getByRole('heading', { name: /Catálogo/i })).toBeVisible({ timeout: 15000 })

    // Abrir modal
    await page.getByRole('button', { name: /Novo serviço/i }).click()
    await expect(page.getByRole('heading', { name: /Novo serviço/i })).toBeVisible({ timeout: 5000 })

    // Preencher
    const nomeInput = page.locator('input[placeholder="Ex: Lavagem com cera"]')
    await nomeInput.fill(nomeServico)
    await page.locator('textarea[placeholder*="Pra ajudar"]').fill('Servico criado via E2E')
    await page.locator('input[placeholder="45"]').fill('99')
    await page.locator('input[placeholder="60"]').fill('30')

    // Salvar
    await page.getByRole('button', { name: /Salvar/i }).click()

    // Verificar que serviço aparece na lista
    await expect(page.getByText(nomeServico)).toBeVisible({ timeout: 15000 })
  })

  // 3. Criar lavagem via wizard completo
  test('criar lavagem via wizard', async ({ page }) => {
    await page.goto('/gestor/nova-lavagem')
    await expect(page.getByRole('heading', { name: /Nova lavagem/i })).toBeVisible({ timeout: 15000 })

    // Step 1: buscar cliente existente pelo seed (há 5 clientes no seed)
    const searchInput = page.locator('input[placeholder*="Buscar por nome"]')
    await searchInput.fill('a') // busca genérica pra listar clientes

    // Esperar que pelo menos um cliente apareça e clicar no primeiro veículo
    const primeiroVeiculo = page.locator('button:has([data-placa])').first()
    await expect(primeiroVeiculo).toBeVisible({ timeout: 10000 })
    await primeiroVeiculo.click()

    // Step 2: deve aparecer a lista de serviços
    await expect(page.getByText(/Escolha o servico/i)).toBeVisible({ timeout: 10000 })

    // Selecionar o primeiro serviço
    const primeiroServico = page.locator('button:has(.font-heading)').first()
    await primeiroServico.click()

    // Clicar "Continuar"
    await page.getByRole('button', { name: /Continuar/i }).click()

    // Step 3: tela de confirmação
    await expect(page.getByText(/Tudo certo/i)).toBeVisible({ timeout: 10000 })

    // Confirmar
    await page.getByRole('button', { name: /Confirmar entrada/i }).click()

    // Deve redirecionar pra lavagens
    await expect(page).toHaveURL(/\/gestor\/lavagens/, { timeout: 15000 })
  })

  // 4. Fluxo completo de status: aguardando → lavando → concluída → retirado
  test('fluxo completo de status até retirada', async ({ page }) => {
    // Primeiro criar uma lavagem via wizard
    await page.goto('/gestor/nova-lavagem')
    await expect(page.getByRole('heading', { name: /Nova lavagem/i })).toBeVisible({ timeout: 15000 })

    // Step 1: buscar e selecionar primeiro veículo disponível
    const searchInput = page.locator('input[placeholder*="Buscar por nome"]')
    await searchInput.fill('a')
    const primeiroVeiculo = page.locator('button:has([data-placa])').first()
    await expect(primeiroVeiculo).toBeVisible({ timeout: 10000 })
    await primeiroVeiculo.click()

    // Step 2: selecionar serviço
    await expect(page.getByText(/Escolha o servico/i)).toBeVisible({ timeout: 10000 })
    const primeiroServico = page.locator('button:has(.font-heading)').first()
    await primeiroServico.click()
    await page.getByRole('button', { name: /Continuar/i }).click()

    // Step 3: confirmar
    await expect(page.getByText(/Tudo certo/i)).toBeVisible({ timeout: 10000 })
    await page.getByRole('button', { name: /Confirmar entrada/i }).click()
    await expect(page).toHaveURL(/\/gestor\/lavagens/, { timeout: 15000 })

    // Fechar WhatsApp modal se aparecer (o wizard abre automaticamente)
    const whatsModal = page.locator('[class*="fixed"]').filter({ hasText: /WhatsApp/ })
    if (await whatsModal.isVisible({ timeout: 3000 }).catch(() => false)) {
      await page.keyboard.press('Escape')
    }

    // Agora na página de lavagens — filtrar por "Aguardando"
    await page.getByRole('button', { name: /Aguardando/i }).first().click()

    // Clicar "Iniciar" no primeiro card aguardando
    const btnIniciar = page.getByRole('button', { name: /Iniciar/i }).first()
    await expect(btnIniciar).toBeVisible({ timeout: 10000 })
    await btnIniciar.click()

    // Fechar WhatsApp modal
    await page.keyboard.press('Escape')

    // Filtrar "Lavando" e clicar "Concluir"
    await page.getByRole('button', { name: /Lavando/i }).first().click()
    const btnConcluir = page.getByRole('button', { name: /Concluir/i }).first()
    await expect(btnConcluir).toBeVisible({ timeout: 10000 })
    await btnConcluir.click()

    // Fechar WhatsApp modal
    await page.keyboard.press('Escape')

    // Filtrar "Pronto" e clicar "Retirar"
    await page.getByRole('button', { name: /Pronto/i }).first().click()
    const btnRetirar = page.getByRole('button', { name: /Retirar/i }).first()
    await expect(btnRetirar).toBeVisible({ timeout: 10000 })
    await btnRetirar.click()

    // Fechar WhatsApp modal
    await page.keyboard.press('Escape')

    // Filtrar "Retirado" e verificar que existe pelo menos 1 card
    await page.getByRole('button', { name: /Retirado/i }).first().click()
    // A coluna "Retirado" deve mostrar pelo menos 1 item
    await expect(page.locator('.font-heading').first()).toBeVisible({ timeout: 10000 })
  })

  // 5. Dashboard mostra stats corretos
  test('dashboard mostra stats corretos', async ({ page }) => {
    await page.goto('/gestor/dashboard')
    await expect(page.getByText(/Como ta o dia hoje/i)).toBeVisible({ timeout: 15000 })

    // Cards de stats visíveis
    await expect(page.getByText('Entradas hoje')).toBeVisible()
    await expect(page.getByText('Faturamento previsto')).toBeVisible()
    await expect(page.getByText('Dinheiro recebido')).toBeVisible()
    await expect(page.getByText('Lavando agora')).toBeVisible()
    await expect(page.getByText('Aguardando')).toBeVisible()

    // Verificar que "Faturamento previsto" mostra valor com R$
    const faturamento = page.locator('text=Faturamento previsto').locator('..')
    await expect(faturamento.locator('text=/R\\$/')).toBeVisible()

    // Verificar que "Dinheiro recebido" mostra valor com R$
    const recebido = page.locator('text=Dinheiro recebido').locator('..')
    await expect(recebido.locator('text=/R\\$/')).toBeVisible()
  })

  // 6. Editar mensagem de etapa nas configurações
  test('editar mensagem de etapa nas configurações', async ({ page }) => {
    await page.goto('/gestor/configuracoes')
    await expect(page.getByRole('heading', { name: /Configuracoes da loja/i })).toBeVisible({ timeout: 15000 })

    // Encontrar seção de mensagens automáticas
    await expect(page.getByText(/Mensagens automaticas por etapa/i)).toBeVisible()

    // Clicar na tab "Entrada" (já é a default, mas garante)
    await page.getByRole('button', { name: /Entrada/i }).click()

    // Localizar o textarea da mensagem de etapa
    const msgTextarea = page.locator('textarea[placeholder*="Escreva a mensagem"]')
    await expect(msgTextarea).toBeVisible()

    // Limpar e digitar nova mensagem
    await msgTextarea.clear()
    const novaMensagem = 'Mensagem E2E teste: seu carro {{placa}} chegou!'
    await msgTextarea.fill(novaMensagem)

    // Verificar que o preview WhatsApp atualiza com o texto
    const previewBox = page.locator('.bg-\\[\\#DCF8C6\\]')
    await expect(previewBox).toContainText('Mensagem E2E teste')

    // Clicar "Salvar alterações"
    await page.getByRole('button', { name: /Salvar alteracoes/i }).first().click()

    // Verificar feedback "Salvo"
    await expect(page.getByText(/Salvo/i).first()).toBeVisible({ timeout: 10000 })
  })

  // 7. Logout redireciona para login
  test('logout redireciona para login', async ({ page }) => {
    await page.goto('/gestor/dashboard')
    await expect(page.getByText(/Como ta o dia hoje/i)).toBeVisible({ timeout: 15000 })

    // Clicar botão de logout (aria-label="Sair")
    await page.getByRole('button', { name: /Sair/i }).click()

    // Verificar redirect pra /login
    await expect(page).toHaveURL(/\/login/, { timeout: 15000 })
  })
})
