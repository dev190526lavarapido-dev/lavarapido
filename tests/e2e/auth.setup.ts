import { test as setup } from '@playwright/test'

const authFile = 'tests/e2e/.auth/user.json'

setup('autenticar como gestor', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel(/email/i).fill('marquinhos@lavarapido.com')
  await page.getByLabel(/senha/i).fill('teste123')
  await page.getByRole('button', { name: /entrar/i }).click()

  // Esperar redirect pro dashboard
  await page.waitForURL('/gestor/dashboard')

  // Salvar estado de auth
  await page.context().storageState({ path: authFile })
})
