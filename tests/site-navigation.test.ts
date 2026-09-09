import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  contentEntries,
  contentSectionOrder,
} from '../scripts/content/catalog'

const navigationModulePath = resolve(
  process.cwd(),
  'docs/.vitepress/navigation.ts',
)

async function loadNavigation() {
  if (!existsSync(navigationModulePath)) return undefined
  return import('../docs/.vitepress/navigation')
}

describe('VitePress navigation', () => {
  test('defines the five approved top-level navigation items', async () => {
    const navigation = await loadNavigation()

    expect(navigation, 'docs/.vitepress/navigation.ts must exist').toBeDefined()
    if (!navigation) return

    expect(navigation.topNav).toEqual([
      { text: '首页', link: '/' },
      { text: '使用指南', link: '/guide/overview.html', activeMatch: '^/guide/' },
      { text: 'API', link: '/api/core/monkeyking.html', activeMatch: '^/api/' },
      {
        text: '参考资料',
        link: '/reference/android/activity.html',
        activeMatch: '^/reference/',
      },
      {
        text: '更新日志',
        link: '/project/changelog.html',
        activeMatch: '^/project/changelog(?:\\.html)?$',
      },
    ])
  })

  test('derives every sidebar page and section order from the content catalog', async () => {
    const navigation = await loadNavigation()

    expect(navigation, 'docs/.vitepress/navigation.ts must exist').toBeDefined()
    if (!navigation) return

    const sidebarGroups = Object.values(navigation.sidebar).flatMap((value) =>
      Array.isArray(value) ? value : value.items,
    )
    const sidebarLinks = sidebarGroups.flatMap((group) =>
      (group.items ?? []).map((item) => item.link),
    )

    expect(Object.keys(navigation.sidebar)).toEqual([
      '/guide/',
      '/project/',
      '/api/',
      '/reference/',
    ])
    expect(sidebarLinks).toEqual(contentEntries.map(({ route }) => route))
    expect(sidebarGroups.map((group) => group.text)).toEqual(
      contentSectionOrder.map(
        (sectionId) => navigation.sidebarSectionLabels[sectionId],
      ),
    )
    expect(new Set(sidebarLinks).size).toBe(contentEntries.length)
  })
})
