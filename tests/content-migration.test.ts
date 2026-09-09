import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
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
} from '../scripts/content/markdown-links'
import {
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

function writeFixture(root: string, path: string, content: string): void {
  const absolutePath = resolve(root, path)
  mkdirSync(dirname(absolutePath), { recursive: true })
  writeFileSync(absolutePath, content)
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

describe('deterministic Markdown migration', () => {
  const current = entryFor('api/ui.md')

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
    const output = migrateMarkdown(input, { current })

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

  test('repairs the audited syntax and broken-image cases contextually', () => {
    expect(
      repairKnownContentDefects(
        '* `pts` {Array<number>}\n例如 Array<T>.\n',
        { current: entryFor('api/canvas.md') },
      ),
    ).toContain('* `pts` {Array&lt;number&gt;}')

    expect(
      repairKnownContentDefects(
        '* code {number} | <String> 要按下的按键\n',
        { current: entryFor('api/keys.md') },
      ),
    ).toContain('* code {number} | &lt;String&gt; 要按下的按键')

    expect(
      repairKnownContentDefects(
        '![ex-properties](images/ex1-properties.png)\n',
        { current },
      ),
    ).toBe('![ex-properties](images/ex-properties.png)\n')

    expect(
      repairKnownContentDefects(
        '效果如图：\n\n![ex-input](ex-input.png)\n',
        { current },
      ),
    ).toBe('效果如下：\n')

    expect(
      repairKnownContentDefects(
        '这里的x轴, y轴, z轴所属的坐标系统如下图(其中z轴垂直于设备屏幕表面):\n\n  !![axis_device](#images/axis_device.png)\n',
        { current: entryFor('api/sensors.md') },
      ),
    ).toBe(
      'x 轴和 y 轴位于设备屏幕平面内，z 轴垂直于设备屏幕表面。\n',
    )
  })

  test('is idempotent', () => {
    const input = readFileSync(fixturePath, 'utf8')
    const once = migrateMarkdown(input, { current })

    expect(migrateMarkdown(once, { current })).toBe(once)
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

  test('normalizes badjs and e4x fences but leaves their bodies untouched', () => {
    const output = preprocessMarkdown(
      '```badjs\n{{ value }}\n```\n\n```e4x\n<tag />\n```\n',
      { current },
    )

    expect(output).toBe(
      '```js\n{{ value }}\n```\n\n```js\n<tag />\n```\n',
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

  test('dry-runs all 101 retained pages against the final heading index', async () => {
    const sources = contentEntries.map((entry) => ({
      entry,
      markdown: preprocessMarkdown(readFileSync(entry.legacySource, 'utf8'), {
        current: entry,
      }),
    }))
    const headingIndex = await buildHeadingIndex(sources)
    const totals = {
      automaticFragments: 0,
      overrides: 0,
      unlinked: 0,
    }

    for (const source of sources) {
      const result = rewriteMarkdownLinksWithReport(source.markdown, {
        current: source.entry,
        entries: contentEntries,
        headingIndex,
      })
      totals.automaticFragments += result.report.automaticFragments
      totals.overrides += result.report.overrides
      totals.unlinked += result.report.unlinked
    }

    expect(sources).toHaveLength(101)
    expect(totals).toEqual({
      automaticFragments: 169,
      overrides: 64,
      unlinked: 20,
    })
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

  test('runs two passes in a temporary repository and is idempotent', async () => {
    const first = testEntry('first', 'docs/guide/first.md')
    const second = testEntry('second', 'docs/api/core/second.md')
    writeFixture(
      root,
      first.legacySource,
      '# AutoJs6 Guide\n\n[Target](second#second_target)\n\n![Shot](images/autojs6-notification-list.png)\n',
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
    expect(existsSync(resolve(root, first.legacySource))).toBe(false)
    expect(existsSync(resolve(root, 'api/static'))).toBe(false)
    expect(existsSync(resolve(root, 'docs/old.html'))).toBe(false)
    expect(readFileSync(resolve(root, 'docs/superpowers/keep.md'), 'utf8')).toBe(
      'keep\n',
    )
  })
})
