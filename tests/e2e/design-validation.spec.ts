import { expect, test } from '@playwright/test'

const designRoute = '/(dashboard)/design'

test.describe('Design configuration validation', () => {
  test('prevents invalid submissions and succeeds after correction', async ({ page }) => {
    await page.goto(designRoute)

    await expect(page.getByRole('heading', { name: 'Design Studio' })).toBeVisible()

    const lengthInput = page.getByLabel('length').first()
    await lengthInput.fill('-5')

    await page.getByRole('button', { name: 'Generate NX Expressions' }).click()

    await expect(
      page.getByText('Please correct the highlighted fields before submitting.')
    ).toBeVisible()

    await lengthInput.fill('60')

    await page.getByRole('button', { name: 'Generate NX Expressions' }).click()

    await expect(
      page.getByText(/NX job .* queued\. Geometry handle:/)
    ).toBeVisible()
  })
})
