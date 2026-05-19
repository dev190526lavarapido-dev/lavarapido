import { test, expect } from '@playwright/test'

test.describe('Auth', () => {
  test('dashboard carrega quando autenticado', async ({ page }) => {
    await page.goto('/gestor/dashboard')
    await expect(page).toHaveURL(/\/gestor\/dashboard/)
    // Verifica que algum conteúdo do dashboard está visível
    await expect(page.locator('body')).toBeVisible()
  })

  test('redireciona pra login sem auth', async ({ browser }) => {
    // Contexto limpo, sem cookies
    const context = await browser.newContext({ storageState: undefined })
    const page = await context.newPage()
    // Ir direto pra rota protegida
    const response = await page.goto('/gestor/dashboard', { waitUntil: 'domcontentloaded' })
    // Middleware deve redirecionar — verificar URL final com timeout generoso
    await expect(page).toHaveURL(/\/login/, { timeout: 15000 })
    await context.close()
  })

  test('login com credenciais validas', async ({ browser }) => {
    const context = await browser.newContext({ storageState: undefined })
    const page = await context.newPage()
    await page.goto('/login', { waitUntil: 'domcontentloaded' })
    // Esperar o form renderizar (client component)
    await page.waitForSelector('#email', { timeout: 15000 })
    await page.fill('#email', 'marquinhos@lavarapido.com')
    await page.fill('#password', 'teste123')
    await page.getByRole('button', { name: /entrar/i }).click()
    await page.waitForURL('**/gestor/dashboard', { timeout: 15000 })
    await expect(page).toHaveURL(/\/gestor\/dashboard/)
    await context.close()
  })
})
