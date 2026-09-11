import { expect, test } from '@playwright/test'

test.describe('desktop documentation journeys', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('home presents the Monkey King hero and primary navigation', async ({
    page,
  }) => {
    await page.goto('/')

    const siteHeader = page.getByRole('banner')
    await expect(
      siteHeader.getByRole('link', { name: /Monkey King/ }),
    ).toBeVisible()
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /Monkey King\s*自动化开发文档/,
      }),
    ).toBeVisible()

    const primaryNavigation = page.getByRole('navigation', {
      name: 'Main Navigation',
    })
    for (const linkName of ['首页', '使用指南', 'API', '参考资料', '版本与支持']) {
      await expect(
        primaryNavigation.getByRole('link', {
          name: linkName,
          exact: true,
        }),
      ).toBeVisible()
    }

    await page.getByRole('link', { name: '开始阅读', exact: true }).click()
    await expect(page).toHaveURL(/\/guide\/overview\.html$/)
    await expect(
      page.getByRole('heading', { level: 1, name: '综述 (Overview)' }),
    ).toBeVisible()
  })

  test('API outline anchor updates the URL and identifies its heading', async ({
    page,
  }) => {
    await page.goto('/api/core/monkeyking.html')

    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Monkey King 本体应用',
      }),
    ).toBeVisible()

    const outline = page.getByRole('navigation', { name: '本页目录' })
    await expect(outline).toBeVisible()
    await outline
      .getByRole('link', { name: '[m] getLanguageTag', exact: true })
      .click()

    await expect(page).toHaveURL(
      /\/api\/core\/monkeyking\.html#m-getlanguagetag$/,
    )
    const targetHeading = page.getByRole('heading', {
      level: 2,
      name: '[m] getLanguageTag',
    })
    await expect(targetHeading).toHaveAttribute('id', 'm-getlanguagetag')
    await expect(targetHeading).toBeInViewport()
  })

  test('local search selects the Monkey King API result', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: '搜索 API' }).click()
    const searchInput = page.getByRole('searchbox')
    await expect(searchInput).toBeVisible()
    await searchInput.fill('getLanguageTag')

    const searchResults = page
      .locator('.VPLocalSearchBox')
      .getByRole('listbox')
    const apiResult = searchResults.locator(
      'a[href="/api/core/monkeyking.html#getlanguagetag"]',
    )
    await expect(apiResult).toBeVisible()
    await expect(apiResult).toHaveAccessibleName(/getLanguageTag/)
    await apiResult.click()

    await expect(page).toHaveURL(
      /\/api\/core\/monkeyking\.html#getlanguagetag$/,
    )
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Monkey King 本体应用',
      }),
    ).toBeVisible()
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: 'getLanguageTag()',
      }),
    ).toBeInViewport()
  })

  test('appearance switch changes both the document theme and switch state', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/')

    const documentElement = page.locator('html')
    const switchToDark = page.getByRole('switch', {
      name: '切换到深色模式',
    })
    await expect(documentElement).not.toHaveClass(/\bdark\b/)
    await expect(switchToDark).toHaveAttribute('aria-checked', 'false')

    await switchToDark.click()

    await expect(documentElement).toHaveClass(/\bdark\b/)
    const switchToLight = page.getByRole('switch', {
      name: '切换到浅色模式',
    })
    await expect(switchToLight).toHaveAttribute('aria-checked', 'true')
    await expect(switchToLight).toHaveAttribute('title', '切换到浅色模式')
  })

  test('unknown HTML route shows the branded 404 and returns home', async ({
    page,
  }) => {
    await page.goto('/missing-monkeyking-documentation.html')

    await expect(page.getByText('404', { exact: true })).toBeVisible()
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: '没有找到这页 Monkey King 文档',
      }),
    ).toBeVisible()
    await expect(
      page.getByText('页面可能已经移动，试试搜索文档或返回 Monkey King 首页。'),
    ).toBeVisible()

    await page
      .getByRole('link', { name: '返回 Monkey King 文档首页' })
      .click()
    await expect(page).toHaveURL(/\/$/)
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /Monkey King\s*自动化开发文档/,
      }),
    ).toBeVisible()
  })

  test('guide links across categories to the project documentation', async ({
    page,
  }) => {
    await page.goto('/guide/overview.html')

    await page
      .getByRole('main')
      .getByRole('link', { name: '关于文档', exact: true })
      .click()

    await expect(page).toHaveURL(/\/project\/about\.html$/)
    await expect(
      page.getByRole('heading', { level: 1, name: '关于文档 (About)' }),
    ).toBeVisible()
  })
})

test.describe('mobile documentation journeys', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('mobile menu exposes primary navigation and opens the API page', async ({
    page,
  }) => {
    await page.goto('/')

    const brandLink = page.getByRole('banner').getByRole('link', {
      name: /Monkey King/,
    })
    await expect(brandLink).toBeVisible()

    const menuButton = page.getByRole('button', { name: 'mobile navigation' })
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    await menuButton.click()
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true')

    const mobileNavigation = page.getByRole('navigation').filter({
      has: page.getByRole('link', { name: 'API', exact: true }),
    })
    await expect(mobileNavigation).toBeVisible()
    for (const linkName of ['首页', '使用指南', 'API', '参考资料', '版本与支持']) {
      await expect(
        mobileNavigation.getByRole('link', {
          name: linkName,
          exact: true,
        }),
      ).toBeVisible()
    }

    await mobileNavigation
      .getByRole('link', { name: 'API', exact: true })
      .click()
    await expect(page).toHaveURL(/\/api\/core\/monkeyking\.html$/)
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Monkey King 本体应用',
      }),
    ).toBeVisible()
    await expect(brandLink).toBeVisible()
  })
})
