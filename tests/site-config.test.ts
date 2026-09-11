import { existsSync, readFileSync } from 'node:fs'
import { isAbsolute, resolve } from 'node:path'
import { sidebar, topNav } from '../docs/.vitepress/navigation'

const configPath = resolve(process.cwd(), 'docs/.vitepress/config.mts')

async function loadConfig() {
  if (!existsSync(configPath)) return undefined
  return import('../docs/.vitepress/config.mts')
}

describe('VitePress site configuration', () => {
  test('uses docs as the source root with strict, searchable Chinese documentation settings', async () => {
    const configModule = await loadConfig()

    expect(configModule, 'docs/.vitepress/config.mts must exist').toBeDefined()
    if (!configModule) return

    const config = configModule.createSiteConfig('web')
    const theme = config.themeConfig

    expect(config).toMatchObject({
      lang: 'zh-CN',
      title: 'Monkey King',
      base: '/',
      cleanUrls: false,
      ignoreDeadLinks: false,
      appearance: true,
      lastUpdated: true,
      srcExclude: ['superpowers/**'],
    })
    expect(config.srcDir).toBeUndefined()
    expect(theme?.logoLink).toBeUndefined()
    expect(theme?.nav).toEqual(topNav)
    expect(theme?.sidebar).toEqual(sidebar)
    expect(theme?.search).toMatchObject({
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文档',
            buttonAriaLabel: '搜索 Monkey King 文档',
          },
          modal: {
            noResultsText: '没有找到相关结果',
          },
        },
      },
    })
    expect(theme?.editLink).toBeUndefined()
    expect(theme?.socialLinks).toBeUndefined()
    expect(theme?.footer?.message).toBe('Monkey King 文档')
    expect(theme?.notFound).toMatchObject({
      code: '404',
      title: '没有找到这页 Monkey King 文档',
      linkText: '返回文档首页',
      linkLabel: '返回 Monkey King 文档首页',
    })
  })

  test('selects absolute web and Android outputs from DOCS_BUILD_TARGET semantics', async () => {
    const configModule = await loadConfig()

    expect(configModule, 'docs/.vitepress/config.mts must exist').toBeDefined()
    if (!configModule) return

    const web = configModule.createSiteConfig(undefined)
    const android = configModule.createSiteConfig('android')

    expect(isAbsolute(web.outDir ?? '')).toBe(true)
    expect(web.outDir).toBe(resolve(process.cwd(), 'dist/web'))
    expect(web.base).toBe('/')
    expect(web.head).toContainEqual([
      'link',
      { rel: 'icon', href: '/logo.png', type: 'image/png' },
    ])

    expect(isAbsolute(android.outDir ?? '')).toBe(true)
    expect(android.outDir).toBe(resolve(process.cwd(), 'dist/android'))
    expect(android.base).toBe('/assets/docs/')
    expect(android.head).toContainEqual([
      'link',
      {
        rel: 'icon',
        href: '/assets/docs/logo.png',
        type: 'image/png',
      },
    ])
    expect(() => configModule.createSiteConfig('mobile')).toThrow(
      'Unsupported DOCS_BUILD_TARGET: mobile',
    )
  })

  test('publishes the custom domain through the VitePress public directory', () => {
    const cnamePath = resolve(process.cwd(), 'docs/public/CNAME')

    expect(existsSync(cnamePath), 'docs/public/CNAME must exist').toBe(true)
    if (!existsSync(cnamePath)) return
    expect(readFileSync(cnamePath, 'utf8')).toBe('docs.monkeyking.com\n')
  })
})
