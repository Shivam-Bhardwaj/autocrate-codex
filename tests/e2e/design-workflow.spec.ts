import { test, expect } from '@playwright/test'

test.describe('AutoCrate design workflow', () => {
  test('home page has navigation links', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Launch Design Studio' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Explore Template Library' })).toBeVisible()
  })
})
