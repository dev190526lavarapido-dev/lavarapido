import { test, expect } from '@playwright/test'

test.describe('Auth', () => {
  test('dashboard carrega quando autenticado', async ({ page }) => {
    await page.goto('/gestor/dashboard')
    await expect(page).toHaveURL(/\/gestor\/dashboard/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('redireciona pra login sem auth', async ({ browser }) => {
    const context = await browser.newContext({ storageState: undefined })
    const page = await context.newPage()
    await page.goto('/gestor/dashboard')
    await expect(page).toHaveURL(/\/login/)
    await context.close()
  })

  test('login com credenciais validas', async ({ browser }) => {
    const context = await browser.newContext({ storageState: undefined })
    const page = await context.newPage()
    await page.goto('/login')

    // Esperar hydration — o botão submit só fica funcional após React hidratar
    await expect(page.getByRole('button', { name: /entrar/i })).toBeEnabled()
    await page.getByLabel(/email/i).fill('marquinhos@lavarapido.com')
    await page.getByLabel(/senha/i).fill('teste123')
    await page.getByRole('button', { name: /entrar/i }).click()

    await expect(page).toHaveURL(/\/gestor\/dashboard/)
    await context.close()
  })
})
