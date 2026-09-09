import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { validateRenderedPages } from '../scripts/content/rendered-pages'

describe('rendered page validation', () => {
  const temporaryDirectories: string[] = []

  afterEach(() => {
    for (const directory of temporaryDirectories.splice(0)) {
      rmSync(directory, { recursive: true, force: true })
    }
  })

  function createOutput(): string {
    const output = mkdtempSync(join(tmpdir(), 'monkeyking-rendered-'))
    temporaryDirectories.push(output)
    return output
  }

  function write(output: string, path: string, contents: string | Buffer): void {
    const destination = resolve(output, path)
    mkdirSync(dirname(destination), { recursive: true })
    writeFileSync(destination, contents)
  }

  function writeValidWebFixture(output: string): void {
    write(
      output,
      'index.html',
      [
        '<!doctype html>',
        '<html><head>',
        '<link rel="stylesheet" href="/assets/style.css">',
        '<script type="module" src="/assets/app.js"></script>',
        '</head><body id="VPContent">',
        '<a href="./guide/page.html#Section%20One">page</a>',
        '<a href="#">top</a>',
        '<img src="/logo.png" srcset="/logo.png 1x, /logo-2x.png 2x">',
        '<a href="https://example.com/docs">external</a>',
        '<a href="mailto:docs@example.com">mail</a>',
        '<a href="tel:+10000000000">phone</a>',
        '<img src="data:image/svg+xml,%3Csvg%3E%3C/svg%3E">',
        '<script>const ignored = \'<a href="/missing-from-script.html">\'</script>',
        '</body></html>',
      ].join(''),
    )
    write(
      output,
      'guide/page.html',
      '<!doctype html><html><body id="VPContent"><h1 id="Section One">Page</h1><a href="../index.html#VPContent">home</a></body></html>',
    )
    write(
      output,
      'assets/style.css',
      '.hero{background:url("data:image/svg+xml,%3Csvg%3E%3Cpath%20d=\'(a)\'/%3E%3C/svg%3E")}.icon{src:url(../font.woff2)}',
    )
    write(output, 'assets/app.js', 'import "./chunk.js"; import("./lazy.js")')
    write(output, 'assets/chunk.js', 'export const chunk = true')
    write(output, 'assets/lazy.js', 'export const lazy = true')
    write(output, 'font.woff2', Buffer.from([0, 1, 2]))
    write(output, 'logo.png', Buffer.from([1]))
    write(output, 'logo-2x.png', Buffer.from([2]))
  }

  function validateWeb(output: string): void {
    validateRenderedPages({
      outputDirectory: output,
      base: '/',
      expectedHtmlFiles: ['404.html', 'guide/page.html', 'index.html'],
    })
  }

  test('accepts decoded fragments, local assets, CSS URLs, JS imports and safe external URLs', () => {
    const output = createOutput()
    writeValidWebFixture(output)
    write(
      output,
      '404.html',
      '<!doctype html><html><body id="VPContent"><a href="/">home</a></body></html>',
    )

    expect(() => validateWeb(output)).not.toThrow()
  })

  test('requires the exact rendered HTML inventory', () => {
    const output = createOutput()
    writeValidWebFixture(output)

    expect(() => validateWeb(output)).toThrow(
      'Invalid rendered HTML inventory; missing: 404.html',
    )
  })

  test.each([
    ['missing page', './missing.html', 'Missing rendered page'],
    ['missing fragment', './guide/page.html#missing', 'Missing fragment'],
    ['missing HTML asset', '/missing.png', 'Missing rendered asset'],
    ['unsafe scheme', 'javascript:alert(1)', 'Unsafe URL scheme'],
    ['encoded NUL', '/logo.png%00', 'NUL byte'],
    ['encoded backslash', '/assets%5Cstyle.css', 'backslash'],
    ['relative escape', '../outside.html', 'escapes rendered site base'],
  ])('rejects %s', (_label, href, message) => {
    const output = createOutput()
    writeValidWebFixture(output)
    write(
      output,
      '404.html',
      `<!doctype html><html><body id="VPContent"><a href="${href}">bad</a></body></html>`,
    )

    expect(() => validateWeb(output)).toThrow(message)
  })

  test('reports missing CSS and JavaScript dependencies', () => {
    const output = createOutput()
    writeValidWebFixture(output)
    write(
      output,
      '404.html',
      '<!doctype html><html><body id="VPContent"></body></html>',
    )
    rmSync(resolve(output, 'font.woff2'))
    rmSync(resolve(output, 'assets/lazy.js'))

    expect(() => validateWeb(output)).toThrow('Missing rendered asset')
    expect(() => validateWeb(output)).toThrow('Missing JavaScript import')
  })

  test('requires every absolute Android URL to stay under the asset-loader base', () => {
    const output = createOutput()
    write(
      output,
      'index.html',
      '<!doctype html><html><body id="VPContent"><img src="/logo.png"></body></html>',
    )

    expect(() =>
      validateRenderedPages({
        outputDirectory: output,
        base: '/assets/docs/',
        expectedHtmlFiles: ['index.html'],
        requireBaseForAbsoluteUrls: true,
      }),
    ).toThrow('must start with /assets/docs/')
  })
})
