import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import {
  applyBrandPolicy,
  assertAllowedLegacyBrands,
} from '../scripts/content/brand-policy'
import { contentEntries } from '../scripts/content/catalog'
import type { ContentEntry } from '../scripts/content/catalog'
import {
  AmbiguousFragmentError,
  buildHeadingIndex,
  resolveCatalogLink,
  rewriteMarkdownLinks,
  rewriteMarkdownLinksWithReport,
  UnresolvedFragmentError,
} from '../scripts/content/markdown-links'
import { scanMarkdownCode } from '../scripts/content/markdown-source'
import {
  defaultLegacyArtifactInventory,
  migrateContent,
  migrateMarkdown,
  preprocessMarkdown,
  repairKnownContentDefects,
  resolveRepoPath,
} from '../scripts/migrate-content'

const fixturePath = resolve(
  process.cwd(),
  'tests/fixtures/content/link-cases.md',
)
const expectedPublicCname = 'docs.monkeyking.com\n'
const expectedLogoSha256 =
  'a7bc5657e071e590708783a107a94f0f550f23d95769eab6b9ed4b633fd67e32'
const require = createRequire(import.meta.url)
const markedLegacy = require('marked-legacy') as (markdown: string) => string

function entryFor(legacySource: string) {
  const entry = contentEntries.find(
    (candidate) => candidate.legacySource === legacySource,
  )

  if (!entry) {
    throw new Error('Missing test catalog entry for ' + legacySource)
  }

  return entry
}

function testEntry(legacyStem: string, target: string): ContentEntry {
  const source = target.startsWith('docs/') ? target : `docs/${target}`
  const relativeSource = source.slice('docs/'.length, -'.md'.length)
  return {
    id: relativeSource.replaceAll('/', '.'),
    legacySource: `api/${legacyStem}.md`,
    source,
    route: `/${relativeSource}.html`,
    title: legacyStem,
    section: relativeSource.slice(
      0,
      relativeSource.lastIndexOf('/'),
    ) as ContentEntry['section'],
    legacyJsonNames: [legacyStem],
  }
}

function writeFixture(root: string, path: string, content: string | Buffer): void {
  const absolutePath = resolve(root, path)
  mkdirSync(dirname(absolutePath), { recursive: true })
  writeFileSync(absolutePath, content)
}

function snapshotDirectoryHashes(
  root: string,
  directory: string,
): Readonly<Record<string, string>> {
  const absoluteDirectory = resolve(root, directory)
  if (!existsSync(absoluteDirectory)) return Object.freeze({})

  const entries = snapshotFiles(absoluteDirectory).map((entry) => {
    const separator = entry.indexOf('\0')
    const path = entry.slice(0, separator)
    const absolutePath = resolve(absoluteDirectory, path)
    return [
      path,
      createHash('sha256').update(readFileSync(absolutePath)).digest('hex'),
    ] as const
  })
  return Object.freeze(Object.fromEntries(entries))
}

function snapshotFiles(root: string, directory = root): readonly string[] {
  if (!existsSync(directory)) return []
  return readdirSync(directory, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap((entry) => {
      const path = resolve(directory, entry.name)
      return entry.isDirectory()
        ? snapshotFiles(root, path)
        : [`${path.slice(root.length + 1)}\0${readFileSync(path, 'utf8')}`]
    })
}

function readCatalogMarkdown(entry: ContentEntry): string {
  const canonicalPath = resolve(process.cwd(), entry.source)
  const legacyPath = resolve(process.cwd(), entry.legacySource)
  return readFileSync(existsSync(canonicalPath) ? canonicalPath : legacyPath, 'utf8')
}

function currentEntryPath(
  root: string,
  entry: ContentEntry,
): { readonly path: string; readonly migrated: boolean } {
  const canonicalPath = resolve(root, entry.source)
  if (existsSync(canonicalPath)) return { path: canonicalPath, migrated: true }
  return { path: resolve(root, entry.legacySource), migrated: false }
}

function copyCurrentContentCorpus(root: string): boolean {
  const legacyDirectory = resolve(process.cwd(), 'api')
  if (existsSync(legacyDirectory)) {
    cpSync(legacyDirectory, resolve(root, 'api'), { recursive: true })
    for (const legacyDocsDirectory of ['assets', 'images', 'plugins']) {
      const source = resolve(process.cwd(), 'docs', legacyDocsDirectory)
      if (existsSync(source)) {
        cpSync(source, resolve(root, 'docs', legacyDocsDirectory), {
          recursive: true,
        })
      }
    }
    mkdirSync(resolve(root, 'docs/public'), { recursive: true })
    cpSync(
      resolve(process.cwd(), 'docs/public/logo.png'),
      resolve(root, 'docs/public/logo.png'),
    )
    return true
  }

  cpSync(resolve(process.cwd(), 'docs'), resolve(root, 'docs'), {
    recursive: true,
  })
  return false
}

function countOutsideMarkdownCode(markdown: string, token: string): number {
  const { protectedRanges } = scanMarkdownCode(markdown)
  let count = 0
  let cursor = 0

  for (const range of protectedRanges) {
    count += markdown.slice(cursor, range.start).split(token).length - 1
    cursor = range.end
  }
  return count + markdown.slice(cursor).split(token).length - 1
}

function countCatalogToken(root: string, token: string): number {
  return contentEntries.reduce((count, entry) => {
    const canonicalPath = resolve(root, entry.source)
    const legacyPath = resolve(root, entry.legacySource)
    const path = existsSync(canonicalPath) ? canonicalPath : legacyPath
    return count + countOutsideMarkdownCode(readFileSync(path, 'utf8'), token)
  }, 0)
}

describe('deterministic Markdown migration', () => {
  const current = entryFor('api/ui.md')
  const fixtureCurrent = {
    ...current,
    legacySource: 'api/contentMigrationFixture.md',
  }

  test('rewrites catalog links relative to the target Markdown source', () => {
    expect(resolveCatalogLink('api/global.md#waitcondition', current)).toBe(
      '../core/global.md#wait-condition',
    )
    expect(resolveCatalogLink('dataTypes#string', current)).toBe(
      '../types/data-types.md#string',
    )
    expect(resolveCatalogLink('autojs.html', current)).toBe(
      '../core/monkeyking.md',
    )
    expect(resolveCatalogLink('ui.md#textstyle', current)).toBe('#textstyle')
  })

  test('rewrites links and images without touching external protocols', () => {
    const input = readFileSync(fixturePath, 'utf8')
    const output = rewriteMarkdownLinks(input, current)

    expect(output).toContain(
      '[Global wait](../core/global.md#wait-condition)',
    )
    expect(output).toContain('[Data type](../types/data-types.md#string)')
    expect(output).toContain('[Monkey King](../core/monkeyking.md)')
    expect(output).toContain('[Current page](#textstyle)')
    expect(output).toContain(
      '[Docsify absolute](../system/console.md#m-show)',
    )
    expect(output).toContain('[global-ref]: ../core/global.md#wait-condition')
    expect(output).toContain('[//]: # (hidden Markdown comment)')
    expect(output).toContain('Missing legacy page')
    expect(output).not.toContain('[Missing legacy page](')
    expect(output).toContain('[External](https://example.com/autojs)')
    expect(output).toContain('[Mail](mailto:docs@example.com)')
    expect(output).toContain('[Phone](tel:+10086)')
    expect(output).toContain('[Data](data:text/plain,AutoJs6)')
    expect(output).toContain('![Example](/images/ex1.png)')
    expect(output).toContain('<img src="/images/logo.png" alt="Logo">')
    expect(output).toContain(
      '<source srcset="/images/monkeyking-notification-list.png 1x, /images/ex1.png 2x">',
    )
  })

  test('escapes Vue interpolation only in prose', () => {
    const input = readFileSync(fixturePath, 'utf8')
    const output = migrateMarkdown(input, { current: fixtureCurrent })

    expect(output).toContain(
      'Literal object: &#123;&#123; value: true &#125;&#125;',
    )
    expect(output).toContain('Inline code: `{{ value: true }}`')
    expect(output).toContain(
      'Inline link code: `[Global](global#waitcondition)`',
    )
    expect(output).toContain("const template = '{{ value: true }}'")
    expect(output).toContain('[Code link](global#waitcondition)')
  })

  test('applies only current-product brand replacements', () => {
    const input = readFileSync(fixturePath, 'utf8')
    const output = applyBrandPolicy(input, { current })

    expect(output).toContain(
      'Monkey King uses `monkeyking.themeColor` and package `com.qiaomu.monkeyking`.',
    )
    expect(output).toContain(
      'Repository: https://github.com/qiaomu-s/MonkeyKing-Documentation',
    )
    expect(output).toContain('Website: https://docs.monkeyking.com')
    expect(output).toContain(
      'Keep upstream Auto.js, AutoJs-Docs, Auto.js Pro, and `org.autojs.autojs`.',
    )
    expect(() => assertAllowedLegacyBrands(output, { current })).not.toThrow()
  })

  test('replaces standalone AutoJs without changing allowed names or URLs', () => {
    const input = [
      'AutoJs adjusts coordinates for the current product.',
      'Keep AutoJsPro, AutoJs-Docs, and Auto.js unchanged.',
      'External: https://example.com/products/AutoJs',
    ].join('\n')

    expect(applyBrandPolicy(input, { current })).toBe(
      [
        'Monkey King adjusts coordinates for the current product.',
        'Keep AutoJsPro, AutoJs-Docs, and Auto.js unchanged.',
        'External: https://example.com/products/AutoJs',
      ].join('\n'),
    )
  })

  test('rejects standalone AutoJs while preserving approved legacy forms', () => {
    expect(() => assertAllowedLegacyBrands('AutoJs\n', { current })).toThrow(
      /Unapproved legacy brand references/,
    )

    expect(() =>
      assertAllowedLegacyBrands(
        [
          'AutoJsPro',
          'AutoJs-Docs',
          'Auto.js',
          'https://example.com/products/AutoJs',
          'Keep upstream Auto.js, AutoJs-Docs, Auto.js Pro, and `org.autojs.autojs`.',
        ].join('\n'),
        { current },
      ),
    ).not.toThrow()
  })

  test('keeps historical changelog identity while updating current URLs', () => {
    const changelog = entryFor('api/changelog.md')
    const input =
      'AutoJs6 1.1.8\nhttps://docs.autojs6.com/#/console\n' +
      'SuperMonster003/AutoJs6-Documentation\n'
    const output = applyBrandPolicy(input, { current: changelog })

    expect(output).toContain('AutoJs6 1.1.8')
    expect(output).toContain('https://docs.monkeyking.com/#/console')
    expect(output).toContain('qiaomu-s/MonkeyKing-Documentation')
  })

  test('preserves the exact third-party Auto.js and AutoJsPro enum rows', () => {
    const appType = entryFor('api/appType.md')
    const output = applyBrandPolicy(
      readCatalogMarkdown(appType),
      { current: appType },
    )

    expect(output).toContain(
      '| AUTOJS           | Auto.js        | ~                 | org.autojs.autojs                  | autojs           |',
    )
    expect(output).toContain(
      '| AUTOJSPRO        | AutoJsPro      | ~                 | org.autojs.autojspro               | autojspro        |',
    )
    expect(output).not.toContain('com.qiaomu.monkeykingpro')
    expect(() => assertAllowedLegacyBrands(output, { current: appType })).not.toThrow()
  })

  test('repairs and validates every audited baseline idempotently', () => {
    const repairedBySource = new Map<string, string>()
    for (const legacySource of [
      'api/canvas.md',
      'api/dataTypes.md',
      'api/httpRequestHeadersType.md',
      'api/keys.md',
      'api/color.md',
      'api/events.md',
      'api/image.md',
      'api/ui.md',
      'api/ocrOptionsType.md',
      'api/sensors.md',
    ]) {
      const entry = entryFor(legacySource)
      const repaired = repairKnownContentDefects(
        readCatalogMarkdown(entry),
        { current: entry },
      )
      expect(repairKnownContentDefects(repaired, { current: entry })).toBe(
        repaired,
      )
      repairedBySource.set(legacySource, repaired)
    }

    expect(repairedBySource.get('api/canvas.md')).toContain(
      'Array&lt;number&gt;',
    )
    expect(repairedBySource.get('api/dataTypes.md')).toContain(
      '例如 `Array<T>`.',
    )
    expect(repairedBySource.get('api/httpRequestHeadersType.md')).toContain(
      '&lt;cookie-name&gt;=&lt;cookie-value&gt;',
    )
    expect(repairedBySource.get('api/keys.md')).toContain('&lt;String&gt;')
    expect(repairedBySource.get('api/color.md')).not.toContain("'yellow'`.")
    expect(repairedBySource.get('api/events.md')).toContain("## 事件: 'exit'")
    expect(repairedBySource.get('api/image.md')).not.toContain('    * ``\n')
    expect(repairedBySource.get('api/ui.md')).toMatch(
      /!\[ex-properties\]\((?:\/)?images\/ex-properties\.png\)/,
    )
    expect(repairedBySource.get('api/ui.md')).not.toContain('ex-input.png')
    expect(repairedBySource.get('api/ui.md')).not.toContain('ex-hint.png')
    expect(repairedBySource.get('api/sensors.md')).toContain(
      'x 轴和 y 轴位于设备屏幕平面内，z 轴垂直于设备屏幕表面。',
    )
  })

  test.each([
    [
      'legacy H2',
      '## OcrOptions\n\nDescription.\n\n### [p?] region\n',
    ],
    [
      'previous duplicate H1 and H2',
      '# OcrOptions\n\n## OcrOptions\n\nDescription.\n\n### [p?] region\n',
    ],
  ])('normalizes the %s OCR title idempotently', (_label, input) => {
    const ocrOptions = entryFor('api/ocrOptionsType.md')
    const expected =
      '# OcrOptions\n\nDescription.\n\n### [p?] region\n'
    const repaired = repairKnownContentDefects(input, { current: ocrOptions })

    expect(repaired).toBe(expected)
    expect(repairKnownContentDefects(repaired, { current: ocrOptions })).toBe(
      expected,
    )
  })

  test('rejects an audited page when neither legacy nor repaired state is present', () => {
    const canvas = entryFor('api/canvas.md')
    const source = readCatalogMarkdown(canvas)
    const drifted = source.includes('Array&lt;number&gt;')
      ? source.replace('Array&lt;number&gt;', 'Array&lt;Number&gt;')
      : source.replace('Array<number>', 'Array<Number>')

    expect(() =>
      repairKnownContentDefects(drifted, { current: canvas }),
    ).toThrow(/Audited repair state mismatch.*canvas/i)
  })

  test('is idempotent', () => {
    const input = readFileSync(fixturePath, 'utf8')
    const once = migrateMarkdown(input, { current: fixtureCurrent })

    expect(migrateMarkdown(once, { current: fixtureCurrent })).toBe(once)
  })

  test('uses VitePress heading ids and rejects ambiguous normalized matches', async () => {
    const target = testEntry('target', 'docs/api/core/target.md')
    const headingIndex = await buildHeadingIndex([
      {
        entry: target,
        markdown:
          '# Target\n\n## Wait condition\n\n## 中文：`foo()`\n\n## Alternate {#wait_condition}\n',
      },
    ])

    expect(headingIndex.get(target.id)).toEqual([
      'target',
      'wait-condition',
      '中文-foo',
      'wait_condition',
    ])
    expect(() =>
      resolveCatalogLink('target#waitcondition', target, {
        entries: [target],
        headingIndex,
      }),
    ).toThrow(AmbiguousFragmentError)
  })

  test('validates explicit override fragments against the target heading index', () => {
    const events = entryFor('api/events.md')
    const image = entryFor('api/image.md')

    expect(() =>
      rewriteMarkdownLinks('[Point](images#images_point)\n', {
        current: events,
        headingIndex: new Map([[image.id, ['not-point']]]),
      }),
    ).toThrow(UnresolvedFragmentError)
  })

  test('normalizes badjs and e4x fences but leaves their bodies untouched', () => {
    const output = preprocessMarkdown(
      '```badjs\n{{ value }}\n```\n\n```e4x\n<tag />\n```\n',
      { current: fixtureCurrent },
    )

    expect(output).toBe(
      '```js\n{{ value }}\n```\n\n```js\n<tag />\n```\n',
    )
  })

  test('normalizes trailing whitespace while preserving prose hard breaks', () => {
    const input =
      'Hard break.  \n' +
      'Single trailing space. \n\n' +
      '```js\n' +
      'const value = 1  \n' +
      '```\n\n'

    expect(preprocessMarkdown(input, { current: fixtureCurrent })).toBe(
      'Hard break.<br>\n' +
        'Single trailing space.\n\n' +
        '```js\n' +
        'const value = 1\n' +
        '```\n',
    )
  })

  test('preserves legacy table cell semantics and repairs prior table break artifacts', () => {
    const legacy =
      '| Name | Value |  \n' +
      '|------|-------|\n' +
      '| one  | two   |      \n'
    const expected =
      '| Name | Value |\n' +
      '|------|-------|\n' +
      '| one  | two   |\n'
    const migrated = preprocessMarkdown(legacy, { current: fixtureCurrent })
    const repaired = preprocessMarkdown(
      expected.replace('| one  | two   |', '| one  | two   |<br>'),
      { current: fixtureCurrent },
    )
    const legacyHtml = markedLegacy(legacy)

    expect(migrated).toBe(expected)
    expect(repaired).toBe(expected)
    expect(markedLegacy(migrated)).toBe(legacyHtml)
    expect(markedLegacy(repaired)).toBe(legacyHtml)
    expect(legacyHtml.match(/<td>/g)).toHaveLength(2)
    expect(markedLegacy(migrated)).not.toContain('<td><br></td>')
  })

  test('preserves single-column pipe tables without confusing setext headings', () => {
    const legacy =
      '| Name |  \n' +
      '| --- |\n' +
      '| one |      \n\n' +
      'Heading with | separator  \n' +
      '---\n'
    const expected =
      '| Name |\n' +
      '| --- |\n' +
      '| one |\n\n' +
      'Heading with | separator<br>\n' +
      '---\n'
    const alreadyMigrated = expected
      .replace('| Name |\n', '| Name |<br>\n')
      .replace('| one |\n', '| one |<br>\n')

    const migrated = preprocessMarkdown(legacy, { current: fixtureCurrent })
    const repaired = preprocessMarkdown(alreadyMigrated, {
      current: fixtureCurrent,
    })

    expect(migrated).toBe(expected)
    expect(repaired).toBe(expected)
    expect(markedLegacy(migrated).match(/<td>/g)).toHaveLength(1)
    expect(markedLegacy(migrated)).not.toContain('<td><br></td>')
  })

  test('skips multiline code spans, inline HTML code, and blockquoted fences', () => {
    const input =
      'Inline HTML: `<img src="images/logo.png">`\n\n' +
      '`multiline code starts\n' +
      '[Global](global#waitcondition)\n' +
      '<img src="images/logo.png">\n' +
      '{{ value }}\n' +
      'code ends`\n\n' +
      '> ```js\n' +
      '> [Global](global#waitcondition)\n' +
      '> <source srcset="images/logo.png 1x">\n' +
      '> {{ value }}\n' +
      '> ```\n\n' +
      '[Global](global#waitcondition)\n' +
      '<img src="images/logo.png">\n' +
      '{{ value }}\n'
    const output = migrateMarkdown(input, { current: fixtureCurrent })

    expect(output).toContain('Inline HTML: `<img src="images/logo.png">`')
    expect(output).toContain(
      '`multiline code starts\n[Global](global#waitcondition)\n<img src="images/logo.png">\n{{ value }}\ncode ends`',
    )
    expect(output).toContain(
      '> ```js\n> [Global](global#waitcondition)\n> <source srcset="images/logo.png 1x">\n> {{ value }}\n> ```',
    )
    expect(output).toContain(
      '[Global](../core/global.md#wait-condition)\n<img src="/images/logo.png">\n&#123;&#123; value &#125;&#125;',
    )
  })

  test('rewrites multiline links and definitions without changing escaped literals', () => {
    const input =
      '[Global](\n' +
      '  global#waitcondition\n' +
      ')\n\n' +
      '[global-ref]:\n' +
      '  global#waitcondition\n\n' +
      '[Global][global-ref]\n\n' +
      '\\[Global](global#waitcondition)\n'
    const output = rewriteMarkdownLinks(input, fixtureCurrent)

    expect(output).toContain(
      '[Global](\n  ../core/global.md#wait-condition\n)',
    )
    expect(output).toContain(
      '[global-ref]:\n  ../core/global.md#wait-condition\n',
    )
    expect(output).toContain('\\[Global](global#waitcondition)')
  })

  test('normalizes image paths before query strings and fragments', () => {
    const input =
      '![Logo](images/logo.png?v=1#dark)\n' +
      '<img src="images/logo.png?v=1#dark">\n' +
      '<source srcset="images/logo.png?v=1 1x, images/ex1.png?cache=2#hero 2x">\n'
    const output = rewriteMarkdownLinks(input, fixtureCurrent)

    expect(output).toContain('![Logo](/images/logo.png?v=1#dark)')
    expect(output).toContain('<img src="/images/logo.png?v=1#dark">')
    expect(output).toContain(
      '<source srcset="/images/logo.png?v=1 1x, /images/ex1.png?cache=2#hero 2x">',
    )
  })

  test('applies representative fragment overrides and unlinks', () => {
    const exceptions = entryFor('api/exceptions.md')
    expect(
      rewriteMarkdownLinks(
        '[异常处理](#trycatch-语句) [try...catch 语句](#trycatch-语句)\n',
        exceptions,
      ),
    ).toBe(
      '[异常处理](#异常处理) [try...catch 语句](#try-catch-语句)\n',
    )

    const shizuku = entryFor('api/shizuku.md')
    expect(
      rewriteMarkdownLinks('[`ShellResult`](shellResultType)\n', shizuku),
    ).toBe('`ShellResult`\n')

    const webSocket = entryFor('api/webSocketType.md')
    const { markdown, report } = rewriteMarkdownLinksWithReport(
      '[on](eventEmitterType#m-on) [removeListener](eventEmitterType#m-removelistener)\n',
      { current: webSocket },
    )
    expect(markdown).toContain(
      '../system/events.md#eventemitter-on-eventname-listener',
    )
    expect(markdown).toContain(
      '../system/events.md#eventemitter-removelistener-eventname-listener',
    )
    expect(report.overrides).toBe(2)
  })

  test('dry-runs all 101 retained pages in either migration phase', async () => {
    const legacyLayout = existsSync(resolve(process.cwd(), 'api'))
    const sources = contentEntries.map((entry) => ({
      entry,
      markdown: preprocessMarkdown(readCatalogMarkdown(entry), {
        current: entry,
      }),
    }))
    const headingIndex = await buildHeadingIndex(sources)
    const totals = {
      automaticFragments: 0,
      overrides: 0,
      unlinked: 0,
    }
    let changedSources = 0

    for (const source of sources) {
      const result = rewriteMarkdownLinksWithReport(source.markdown, {
        current: source.entry,
        entries: contentEntries,
        headingIndex,
      })
      totals.automaticFragments += result.report.automaticFragments
      totals.overrides += result.report.overrides
      totals.unlinked += result.report.unlinked
      if (result.markdown !== source.markdown) changedSources += 1
    }

    expect(sources).toHaveLength(101)
    if (legacyLayout) {
      expect(totals).toEqual({
        automaticFragments: 169,
        overrides: 64,
        unlinked: 20,
      })
      expect(changedSources).toBeGreaterThan(0)
    } else {
      expect(totals).toEqual({
        automaticFragments: 0,
        overrides: 12,
        unlinked: 0,
      })
      expect(changedSources).toBe(0)
    }
  })
})

describe('content migration orchestration', () => {
  let root = ''

  beforeEach(() => {
    root = mkdtempSync(resolve(tmpdir(), 'monkeyking-content-'))
  })

  afterEach(() => {
    rmSync(root, { recursive: true, force: true })
  })

  test('guards repository boundaries', () => {
    expect(() => resolveRepoPath(root, '../outside.md')).toThrow(
      /outside repository root/,
    )
    expect(() => resolveRepoPath(root, resolve(root, 'absolute.md'))).toThrow(
      /relative repository path/,
    )
  })

  test('encodes the complete default legacy artifact inventory', () => {
    expect(
      Object.fromEntries(
        Object.entries(defaultLegacyArtifactInventory).map(([path, files]) => [
          path,
          files.length,
        ]),
      ),
    ).toEqual({
      'api/static': 44,
      'api/images': 37,
      'docs/assets': 13,
      'docs/images': 37,
      'docs/plugins': 4,
    })
  })

  test('runs two passes in a temporary repository and is idempotent', async () => {
    const first = testEntry('first', 'docs/guide/first.md')
    const second = testEntry('second', 'docs/api/core/second.md')
    writeFixture(
      root,
      first.legacySource,
      '# AutoJs6 Guide\n\n[Target](second#second_target)\n\n![Shot](images/autojs6-notification-list.png)\n\n{{ custom }}\n',
    )
    writeFixture(root, second.legacySource, '# Second target\n')
    writeFixture(root, 'api/images/autojs6-notification-list.png', 'image-a')
    writeFixture(root, 'api/images/logo.png', 'image-b')
    writeFixture(root, 'api/CNAME', 'docs.monkeyking.com\n')
    writeFixture(root, 'api/retired.md', 'retired\n')
    writeFixture(root, 'api/static/legacy.js', 'legacy\n')
    writeFixture(root, 'api/index.html', 'legacy\n')
    writeFixture(root, 'docs/old.html', 'legacy\n')
    writeFixture(root, 'docs/assets/legacy.js', 'legacy\n')
    writeFixture(root, 'docs/superpowers/keep.md', 'keep\n')

    const options = {
      rootDirectory: root,
      entries: [first, second],
      imageNames: ['autojs6-notification-list.png', 'logo.png'],
      deletedSources: ['api/retired.md'],
      legacyArtifactInventory: {
        'api/static': ['legacy.js'],
        'docs/assets': ['legacy.js'],
      },
    } as const
    const firstReport = await migrateContent(options)
    const snapshot = snapshotFiles(root)
    const secondReport = await migrateContent(options)

    expect(firstReport.entriesWritten).toBe(2)
    expect(firstReport.imagesCopied).toBe(2)
    expect(secondReport.entriesWritten).toBe(0)
    expect(secondReport.imagesCopied).toBe(0)
    expect(snapshotFiles(root)).toEqual(snapshot)
    expect(readFileSync(resolve(root, first.source), 'utf8')).toContain(
      '[Target](../api/core/second.md#second-target)',
    )
    expect(readFileSync(resolve(root, first.source), 'utf8')).toContain(
      '![Shot](/images/monkeyking-notification-list.png)',
    )
    expect(readFileSync(resolve(root, first.source), 'utf8')).toContain(
      '&#123;&#123; custom &#125;&#125;',
    )
    expect(existsSync(resolve(root, first.legacySource))).toBe(false)
    expect(existsSync(resolve(root, 'api/static'))).toBe(false)
    expect(existsSync(resolve(root, 'docs/old.html'))).toBe(false)
    expect(readFileSync(resolve(root, 'docs/superpowers/keep.md'), 'utf8')).toBe(
      'keep\n',
    )
  })

  test('prefers an existing canonical source over the legacy fallback', async () => {
    const only = testEntry('only', 'docs/guide/only.md')
    writeFixture(root, only.legacySource, '# Legacy source\n')
    writeFixture(root, only.source, '# Canonical source\n')

    const report = await migrateContent({
      rootDirectory: root,
      entries: [only],
      imageNames: [],
      deletedSources: [],
    })

    expect(report.entriesWritten).toBe(0)
    expect(readFileSync(resolve(root, only.source), 'utf8')).toBe(
      '# Canonical source\n',
    )
  })

  test('writes the exact public CNAME bytes instead of copying the legacy value', async () => {
    const only = testEntry('only', 'docs/guide/only.md')
    writeFixture(root, only.legacySource, '# Only\n')
    writeFixture(root, 'api/CNAME', 'docs.autojs6.com')

    await migrateContent({
      rootDirectory: root,
      entries: [only],
      imageNames: [],
      deletedSources: [],
    })

    expect(readFileSync(resolve(root, 'docs/public/CNAME'), 'utf8')).toBe(
      expectedPublicCname,
    )
  })

  test('repairs a drifted public CNAME during a canonical-only pass', async () => {
    const only = testEntry('only', 'docs/guide/only.md')
    writeFixture(root, only.source, '# Only\n')
    writeFixture(root, 'docs/public/CNAME', 'wrong.example\n')

    await migrateContent({
      rootDirectory: root,
      entries: [only],
      imageNames: [],
      deletedSources: [],
    })

    expect(readFileSync(resolve(root, 'docs/public/CNAME'), 'utf8')).toBe(
      expectedPublicCname,
    )
  })

  test('preserves the planned VitePress site shell across repeated runs', async () => {
    const only = testEntry('only', 'docs/guide/only.md')
    writeFixture(root, only.legacySource, '# Only\n')
    const shellFiles = new Map([
      ['docs/index.md', '# Home\n'],
      ['docs/public/logo.png', 'logo-bytes'],
      ['docs/.vitepress/config.ts', 'export default {}\n'],
      ['docs/.vitepress/theme/index.ts', 'export default {}\n'],
    ])
    for (const [path, content] of shellFiles) writeFixture(root, path, content)
    writeFixture(root, 'docs/superpowers/keep.md', 'keep\n')
    writeFixture(
      root,
      'docs/superpowers/nested/bytes.bin',
      Buffer.from([0, 1, 2, 10, 13, 255]),
    )
    const superpowersBefore = snapshotDirectoryHashes(root, 'docs/superpowers')
    const options = {
      rootDirectory: root,
      entries: [only],
      imageNames: [],
      deletedSources: [],
    } as const

    await migrateContent(options)
    const snapshot = snapshotFiles(root)
    await migrateContent(options)

    expect(snapshotFiles(root)).toEqual(snapshot)
    expect(snapshotDirectoryHashes(root, 'docs/superpowers')).toEqual(
      superpowersBefore,
    )
    for (const [path, content] of shellFiles) {
      expect(readFileSync(resolve(root, path), 'utf8')).toBe(content)
    }
  })

  test('runs the default 101-page migration three times without changing the second pass', async () => {
    const startedLegacy = copyCurrentContentCorpus(root)
    writeFixture(root, 'docs/superpowers/keep.md', 'keep\n')

    expect(
      createHash('sha256')
        .update(readFileSync(resolve(root, 'docs/public/logo.png')))
        .digest('hex'),
    ).toBe(expectedLogoSha256)

    expect(countCatalogToken(root, '{{')).toBe(startedLegacy ? 38 : 0)
    expect(countCatalogToken(root, '}}')).toBe(startedLegacy ? 39 : 0)
    expect(countCatalogToken(root, '&#123;&#123;')).toBe(startedLegacy ? 0 : 38)
    expect(countCatalogToken(root, '&#125;&#125;')).toBe(startedLegacy ? 0 : 39)

    const firstReport = await migrateContent({ rootDirectory: root })
    const firstSnapshot = snapshotFiles(root)
    expect(countCatalogToken(root, '{{')).toBe(0)
    expect(countCatalogToken(root, '}}')).toBe(0)
    expect(countCatalogToken(root, '&#123;&#123;')).toBe(38)
    expect(countCatalogToken(root, '&#125;&#125;')).toBe(39)
    expect(
      readFileSync(resolve(root, entryFor('api/crypto.md').source), 'utf8'),
    ).toContain('- &#125;&#125; - 选项参数')
    const secondReport = await migrateContent({ rootDirectory: root })
    const secondSnapshot = snapshotFiles(root)
    const thirdReport = await migrateContent({ rootDirectory: root })

    expect(firstReport.entriesWritten).toBe(startedLegacy ? 101 : 0)
    expect(firstReport.imagesCopied).toBe(startedLegacy ? 37 : 0)
    expect(secondReport).toEqual({
      entriesWritten: 0,
      imagesCopied: 0,
      pathsDeleted: 0,
    })
    expect(thirdReport).toEqual({
      entriesWritten: 0,
      imagesCopied: 0,
      pathsDeleted: 0,
    })
    expect(secondSnapshot).toEqual(firstSnapshot)
    expect(snapshotFiles(root)).toEqual(firstSnapshot)
    expect(readFileSync(resolve(root, 'docs/superpowers/keep.md'), 'utf8')).toBe(
      'keep\n',
    )
    expect(
      createHash('sha256')
        .update(readFileSync(resolve(root, 'docs/public/images/logo.png')))
        .digest('hex'),
    ).toBe(expectedLogoSha256)
  })

  test('repairs a drifted migrated logo from the committed brand source', async () => {
    copyCurrentContentCorpus(root)
    writeFileSync(resolve(root, 'docs/public/images/logo.png'), 'drifted-logo')

    const report = await migrateContent({ rootDirectory: root })

    expect(report.imagesCopied).toBe(1)
    expect(
      createHash('sha256')
        .update(readFileSync(resolve(root, 'docs/public/logo.png')))
        .digest('hex'),
    ).toBe(expectedLogoSha256)
    expect(
      createHash('sha256')
        .update(readFileSync(resolve(root, 'docs/public/images/logo.png')))
        .digest('hex'),
    ).toBe(expectedLogoSha256)
  })

  test.each([
    [
      'mixed',
      (source: string, migrated: boolean) =>
        source.replace(
          migrated
            ? '&#123;&#123; a: number &#125;&#125;'
            : '{{ a: number }}',
          migrated
            ? '{{ a: number }}'
            : '&#123;&#123; a: number &#125;&#125;',
        ),
    ],
    ['added', (source: string) => `${source}\n{{ added: number }}\n`],
    [
      'missing',
      (source: string, migrated: boolean) =>
        source.replace(
          `${migrated ? '&#123;&#123; a: number &#125;&#125;' : '{{ a: number }}'}\n`,
          '',
        ),
    ],
    [
      'drifted',
      (source: string, migrated: boolean) =>
        source.replace(
          migrated
            ? '&#123;&#123; a: number &#125;&#125;'
            : '{{ a: number }}',
          '{ { a: number } }',
        ),
    ],
  ])(
    'rejects a %s default Vue interpolation state before writing',
    async (_state, mutate) => {
      copyCurrentContentCorpus(root)
      const { path: dataTypesPath, migrated } = currentEntryPath(
        root,
        entryFor('api/dataTypes.md'),
      )
      writeFileSync(
        dataTypesPath,
        mutate(readFileSync(dataTypesPath, 'utf8'), migrated),
      )
      const snapshot = snapshotFiles(root)

      await expect(migrateContent({ rootDirectory: root })).rejects.toThrow(
        /Audited Vue interpolation state mismatch/,
      )
      expect(snapshotFiles(root)).toEqual(snapshot)
    },
  )

  test.each([
    [
      'missing paired closing',
      'api/dataTypes.md',
      (source: string, migrated: boolean) =>
        source.replace(
          migrated
            ? '&#123;&#123; a: number &#125;&#125;'
            : '{{ a: number }}',
          migrated ? '&#123;&#123; a: number &#125;' : '{{ a: number }',
        ),
    ],
    [
      'extra paired closing',
      'api/dataTypes.md',
      (source: string, migrated: boolean) =>
        `${source}\n${migrated ? '&#125;&#125;' : '}}'}\n`,
    ],
    [
      'mixed paired closing',
      'api/dataTypes.md',
      (source: string, migrated: boolean) =>
        source.replace(
          migrated
            ? '&#123;&#123; a: number &#125;&#125;'
            : '{{ a: number }}',
          migrated
            ? '&#123;&#123; a: number }}'
            : '{{ a: number &#125;&#125;',
        ),
    ],
    [
      'drifted nested-type closing literal',
      'api/crypto.md',
      (source: string, migrated: boolean) =>
        source.replace(
          migrated ? '- &#125;&#125; - 选项参数' : '- }} - 选项参数',
          '- } } - 选项参数',
        ),
    ],
  ])(
    'rejects a %s before writing',
    async (_state, legacySource, mutate) => {
      copyCurrentContentCorpus(root)
      const { path: sourcePath, migrated } = currentEntryPath(
        root,
        entryFor(legacySource),
      )
      writeFileSync(
        sourcePath,
        mutate(readFileSync(sourcePath, 'utf8'), migrated),
      )
      const snapshot = snapshotFiles(root)

      await expect(migrateContent({ rootDirectory: root })).rejects.toThrow(
        /Audited Vue interpolation state mismatch/,
      )
      expect(snapshotFiles(root)).toEqual(snapshot)
    },
  )

  test('rejects migrated closing-token drift before writing', async () => {
    const startedLegacy = copyCurrentContentCorpus(root)
    if (startedLegacy) await migrateContent({ rootDirectory: root })
    const dataTypesPath = resolve(root, entryFor('api/dataTypes.md').source)
    writeFileSync(
      dataTypesPath,
      readFileSync(dataTypesPath, 'utf8').replace(
        '&#123;&#123; a: number &#125;&#125;',
        '&#123;&#123; a: number &#125;&#125',
      ),
    )
    const snapshot = snapshotFiles(root)

    await expect(migrateContent({ rootDirectory: root })).rejects.toThrow(
      /Audited Vue interpolation state mismatch/,
    )
    expect(snapshotFiles(root)).toEqual(snapshot)
  })

  test('validates every final brand result before writing any page', async () => {
    const first = testEntry('first', 'docs/guide/first.md')
    const second = testEntry('second', 'docs/guide/second.md')
    writeFixture(root, first.legacySource, '# First\n')
    writeFixture(
      root,
      second.legacySource,
      '# Second\n\nhttps://legacy.autojs6.com/current-product\n',
    )

    await expect(
      migrateContent({
        rootDirectory: root,
        entries: [first, second],
        imageNames: [],
        deletedSources: [],
      }),
    ).rejects.toThrow(/Unapproved legacy brand/)
    expect(existsSync(resolve(root, first.source))).toBe(false)
    expect(existsSync(resolve(root, second.source))).toBe(false)
    expect(existsSync(resolve(root, first.legacySource))).toBe(true)
  })

  test.each([
    ['api top-level', 'api/rogue.bin'],
    ['image', 'api/images/rogue.png'],
    ['static file', 'api/static/rogue.bin'],
    ['nested static font', 'api/static/fonts/rogue.woff2'],
    ['docs', 'docs/rogue.txt'],
    ['public', 'docs/public/rogue.png'],
    ['legacy asset', 'docs/assets/rogue.bin'],
    ['legacy image', 'docs/images/rogue.png'],
    ['legacy plugin', 'docs/plugins/rogue.js'],
    ['nested docs', 'docs/unplanned/rogue.md'],
    ['unplanned 404', 'docs/404.md'],
    ['lookalike VitePress', 'docs/.vitepress-rogue/config.mts'],
  ])('rejects an unknown %s artifact before mutation', async (_kind, artifact) => {
    const only = testEntry('only', 'docs/guide/only.md')
    writeFixture(root, only.legacySource, '# Only\n')
    writeFixture(root, artifact, 'rogue\n')

    await expect(
      migrateContent({
        rootDirectory: root,
        entries: [only],
        imageNames: [],
        deletedSources: [],
      }),
    ).rejects.toThrow(/Unknown .* artifact/)
    expect(existsSync(resolve(root, only.source))).toBe(false)
    expect(readFileSync(resolve(root, artifact), 'utf8')).toBe('rogue\n')
  })

  test('rejects a missing declared legacy artifact before mutation', async () => {
    const only = testEntry('only', 'docs/guide/only.md')
    writeFixture(root, only.legacySource, '# Only\n')
    writeFixture(root, 'api/static/legacy.js', 'legacy\n')

    await expect(
      migrateContent({
        rootDirectory: root,
        entries: [only],
        imageNames: [],
        deletedSources: [],
        legacyArtifactInventory: {
          'api/static': ['legacy.js', 'missing.js'],
        },
      }),
    ).rejects.toThrow(/Missing .*artifact.*missing\.js/i)
    expect(existsSync(resolve(root, only.source))).toBe(false)
    expect(existsSync(resolve(root, 'api/static/legacy.js'))).toBe(true)
  })

  test('rejects a legacy artifact symlink before mutation', async () => {
    const only = testEntry('only', 'docs/guide/only.md')
    writeFixture(root, only.legacySource, '# Only\n')
    writeFixture(root, 'outside.bin', 'outside\n')
    mkdirSync(resolve(root, 'api/static'), { recursive: true })
    symlinkSync(resolve(root, 'outside.bin'), resolve(root, 'api/static/legacy.js'))

    await expect(
      migrateContent({
        rootDirectory: root,
        entries: [only],
        imageNames: [],
        deletedSources: [],
        legacyArtifactInventory: {
          'api/static': ['legacy.js'],
        },
      }),
    ).rejects.toThrow(/symbolic link.*api\/static\/legacy\.js/i)
    expect(existsSync(resolve(root, only.source))).toBe(false)
    expect(lstatSync(resolve(root, 'api/static/legacy.js')).isSymbolicLink()).toBe(
      true,
    )
  })

  test.each([
    'docs/assets/rogue.bin',
    'docs/images/rogue.png',
    'docs/plugins/rogue.js',
  ])(
    'rejects a rogue default legacy artifact before mutating the real canonical tree: %s',
    async (artifact) => {
      copyCurrentContentCorpus(root)
      writeFixture(root, artifact, 'rogue\n')
      const protectedSource = resolve(root, contentEntries[0].source)
      const before = readFileSync(protectedSource)

      await expect(migrateContent({ rootDirectory: root })).rejects.toThrow(
        /Unknown .*artifact/i,
      )
      expect(readFileSync(protectedSource)).toEqual(before)
      expect(readFileSync(resolve(root, artifact), 'utf8')).toBe('rogue\n')
    },
  )
})
