import { expect, test } from '@playwright/test'

test.describe('home API search focus', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('returns focus to the home trigger after Escape closes search', async ({
    page,
  }) => {
    const trigger = page.getByRole('button', { name: '搜索 API' })

    await trigger.click()
    await expect(page.locator('.VPLocalSearchBox')).toBeVisible()
    await page.keyboard.press('Escape')

    await expect(page.locator('.VPLocalSearchBox')).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test('returns focus to the home trigger after the close button is used', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 600, height: 800 })
    const trigger = page.getByRole('button', { name: '搜索 API' })

    await trigger.click()
    await expect(page.locator('.VPLocalSearchBox')).toBeVisible()
    await page.getByRole('button', { name: '关闭搜索' }).click()

    await expect(page.locator('.VPLocalSearchBox')).toBeHidden()
    await expect(trigger).toBeFocused()
  })
})
