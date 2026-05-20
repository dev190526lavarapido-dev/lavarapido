import { test, expect } from '@playwright/test'

test.describe('Páginas Públicas', () => {
  // Vitrine pública carrega
  test('vitrine mostra serviços e info da loja', async ({ browser }) => {
    const context = await browser.newContext({ storageState: undefined })
    const page = await context.newPage()

    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()

    // Nome da loja no hero (é um <div class="nome-loja">, não heading)
    await expect(page.locator('.nome-loja').first()).toBeVisible()

    // Seção de serviços
    await expect(page.getByText(/Nossos servi/i)).toBeVisible()
    await expect(page.getByText(/R\$/).first()).toBeVisible()

    // CTAs
    await expect(page.getByText('WhatsApp')).toBeVisible()
    await expect(page.getByText('Ligar')).toBeVisible()
    await expect(page.getByText('Como chegar')).toBeVisible()

    await context.close()
  })
})
