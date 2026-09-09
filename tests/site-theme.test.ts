import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const docsRoot = resolve(process.cwd(), 'docs')
const themeRoot = resolve(docsRoot, '.vitepress/theme')
const expectedLogoSha256 =
  'a7bc5657e071e590708783a107a94f0f550f23d95769eab6b9ed4b633fd67e32'

function readThemeFile(relativePath: string): string {
  const path = resolve(themeRoot, relativePath)
  expect(existsSync(path), `${relativePath} must exist in the custom theme`).toBe(
    true,
  )
  return existsSync(path) ? readFileSync(path, 'utf8') : ''
}

describe('Monkey King VitePress theme', () => {
  test('provides the approved B-style branded home page', () => {
    const indexPath = resolve(docsRoot, 'index.md')

    expect(existsSync(indexPath), 'docs/index.md must exist').toBe(true)
    if (!existsSync(indexPath)) return

    const homepage = readFileSync(indexPath, 'utf8')
    expect(homepage).toContain('layout: home')
    expect(homepage).toContain('name: Monkey King')
    expect(homepage).toContain('src: /logo.png')
    expect(homepage).toContain('alt: Monkey King 标志')
    expect(homepage).toContain('text: 开始阅读')
    expect(homepage).toContain('link: /guide/overview.html')
    expect(homepage).toContain('text: GitHub')
    expect(homepage).toContain(
      'link: https://github.com/qiaomu-s/MonkeyKing-Documentation',
    )
    expect(homepage).toContain('link: /api/core/monkeyking.html')
    expect(homepage).toContain('link: /reference/android/activity.html')
    expect(homepage).toContain('link: /project/changelog.html')
  })

  test('extends the standard theme and adds an accessible home API search action', () => {
    const themeEntry = readThemeFile('index.ts')
    const layout = readThemeFile('Layout.vue')
    const search = readThemeFile('components/HomeApiSearch.vue')

    expect(themeEntry).toContain("extends: DefaultTheme")
    expect(themeEntry).toContain("import './custom.css'")
    expect(layout).toContain('#home-features-before')
    expect(layout).toContain('<HomeApiSearch />')
    expect(search).toContain('<section')
    expect(search).toContain('aria-labelledby="monkeyking-api-search-title"')
    expect(search).toContain('<button')
    expect(search).toContain('type="button"')
    expect(search).toContain('aria-keyshortcuts="Control+K Meta+K"')
    expect(search).toContain('搜索 API')
    expect(search).toContain("new KeyboardEvent('keydown'")
    expect(search).toContain('watchForSearchDismissal')
    expect(search).toContain("document.querySelector('.VPLocalSearchBox')")
    expect(search).toContain('new MutationObserver')
    expect(search).toContain('requestAnimationFrame')
    expect(search).toContain('trigger.isConnected')
    expect(search).toContain('trigger.focus({ preventScroll: true })')
    expect(search).toContain('onBeforeUnmount')
  })

  test('uses the app logo and WCAG-aware responsive interaction styles', () => {
    const logoPath = resolve(docsRoot, 'public/logo.png')
    const css = readThemeFile('custom.css')

    expect(existsSync(logoPath), 'docs/public/logo.png must exist').toBe(true)
    if (existsSync(logoPath)) {
      const logo = readFileSync(logoPath)
      expect(createHash('sha256').update(logo).digest('hex')).toBe(
        expectedLogoSha256,
      )
      expect(logo.subarray(1, 4).toString('ascii')).toBe('PNG')
      expect(logo.readUInt32BE(16)).toBe(256)
      expect(logo.readUInt32BE(20)).toBe(256)
    }

    expect(css).toContain('--vp-c-brand-1: #00695C;')
    expect(css).toContain('--mk-target-size: 44px;')
    expect(css).toMatch(/:focus-visible/)
    expect(css).toMatch(/min-height:\s*var\(--mk-target-size\)/)
    expect(css).toContain('@media (max-width: 640px)')
    expect(css).toContain('@media (prefers-reduced-motion: reduce)')
  })

  test('uses the theme-provided branded 404 instead of a Markdown source page', () => {
    expect(existsSync(resolve(docsRoot, '404.md'))).toBe(false)
  })
})
