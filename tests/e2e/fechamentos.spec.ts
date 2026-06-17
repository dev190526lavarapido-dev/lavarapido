import { test, expect } from '@playwright/test'

// Fechamento manual idempotente -> aparece no histórico -> extrato do dia.
// Auth herdada do project chromium (storageState do gestor).
test.describe('Fechamentos', () => {
  test('fechar dia manual aparece no histórico e abre o extrato', async ({ page }) => {
    await page.goto('/gestor/fechamentos')
    await expect(page.getByRole('heading', { name: 'Fechamentos' })).toBeVisible()

    // Fecha o dia de hoje (upsert idempotente — pode já existir)
    await page.getByRole('button', { name: /Fechar dia de hoje/i }).click()
    await expect(page.getByText(/consolidado/i)).toBeVisible()

    // Um dia aparece no extrato (link pro detalhe)
    const diaCard = page.locator('a[href*="/gestor/fechamentos/"]').first()
    await expect(diaCard).toBeVisible()

    // Abre o extrato do dia
    await diaCard.click()
    await expect(page).toHaveURL(/\/gestor\/fechamentos\/\d{4}-\d{2}-\d{2}/)

    // Resumo + lista de lavagens do dia
    await expect(page.getByText('Faturamento')).toBeVisible()
    await expect(page.getByText('Novos clientes')).toBeVisible()
    await expect(page.getByRole('heading', { name: /Lavagens do dia/i })).toBeVisible()
  })
})
