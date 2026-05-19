import { test, expect } from '@playwright/test'

test.describe('Auth', () => {
  test('dashboard carrega quando autenticado', async ({ page }) => {
    await page.goto('/gestor/dashboard')
    // Deve estar no dashboard (storageState já logou)
    await expect(page).toHaveURL(/\/gestor\/dashboard/)
  })

  test('redireciona pra login sem auth', async ({ browser }) => {
    // Contexto limpo, sem storageState
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto('/gestor/dashboard')
    await expect(page).toHaveURL(/\/login/)
    await context.close()
  })

  test('login com credenciais validas', async ({ browser }) => {
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('marquinhos@lavarapido.com')
    await page.getByLabel(/senha/i).fill('teste123')
    await page.getByRole('button', { name: /entrar/i }).click()
    await page.waitForURL('/gestor/dashboard')
    await expect(page).toHaveURL(/\/gestor\/dashboard/)
    await context.close()
  })
})
